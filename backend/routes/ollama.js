const express = require('express');
const axios = require('axios');
const router = express.Router();

// Generate response
router.post('/generate', async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.OLLAMA_URL}/api/generate`,
      req.body,
      { timeout: 0 } // allow long responses
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: 'Ollama request failed',
      details: err.message,
    });
  }
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.OLLAMA_URL}/api/chat`,
      req.body,
      { timeout: 0 }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({
      error: 'Ollama chat failed',
      details: err.message,
    });
  }
});

// Stream endpoint
router.post('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Keep connection alive through proxies/load balancers.
  const keepAliveIntervalMs = 15000;
  const keepAliveTimer = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, keepAliveIntervalMs);

  try {
    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
      clearInterval(keepAliveTimer);
    });

    const response = await axios.post(
      `${process.env.OLLAMA_URL}/api/chat`,
      { ...req.body, stream: true },
      {
        timeout: 0,
        responseType: 'stream',
        signal: abortController.signal,
      }
    );

    response.data.setEncoding('utf8');
    let buffer = '';

    response.data.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          continue;
        }

        try {
          const parsedChunk = JSON.parse(trimmedLine);
          res.write(`data: ${JSON.stringify(parsedChunk)}\n\n`);

          if (parsedChunk.done === true) {
            res.write('event: done\ndata: {}\n\n');
            clearInterval(keepAliveTimer);
            res.end();
          }
        } catch {
          res.write(`event: error\ndata: ${JSON.stringify({ message: 'Invalid stream chunk received from Ollama' })}\n\n`);
          clearInterval(keepAliveTimer);
          res.end();
        }
      }
    });

    response.data.on('end', () => {
      clearInterval(keepAliveTimer);
      if (!res.writableEnded) {
        res.write('event: done\ndata: {}\n\n');
        res.end();
      }
    });

    response.data.on('error', (streamError) => {
      clearInterval(keepAliveTimer);
      if (!res.writableEnded) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: streamError.message })}\n\n`);
        res.end();
      }
    });
  } catch (err) {
    clearInterval(keepAliveTimer);
    const message = err.name === 'CanceledError'
      ? 'Client disconnected'
      : err.message;
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
    res.end();
  }
});

module.exports = router;