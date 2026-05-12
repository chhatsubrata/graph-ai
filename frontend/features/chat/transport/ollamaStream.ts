import { extractOllamaChunk, parseSseBuffer } from "./parseSse"

export interface StreamOllamaChatOptions {
  baseUrl: string
  apiKey: string
  model: string
  messages: { role: string; content: string }[]
  signal: AbortSignal
  onDelta: (text: string, channel: "answer" | "thinking") => void
  onDone: () => void
  onError: (message: string) => void
}

export async function streamOllamaChat(options: StreamOllamaChatOptions): Promise<void> {
  const { baseUrl, apiKey, model, messages, signal, onDelta, onDone, onError } = options
  const url = `${baseUrl.replace(/\/$/, "")}/api/ollama/stream`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "x-api-key": apiKey } : {}),
    },
    body: JSON.stringify({ model, messages }),
    signal,
  })

  if (!response.ok || !response.body) {
    onError(`HTTP ${response.status}`)
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let streamErrorMessage = ""

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const { events, remainder } = parseSseBuffer(buffer)
      buffer = remainder

      for (const { event, data } of events) {
        if (event === "done") {
          onDone()
          return
        }
        if (event === "error") {
          try {
            const parsed = data ? JSON.parse(data) : {}
            streamErrorMessage =
              typeof (parsed as { message?: string }).message === "string"
                ? (parsed as { message: string }).message
                : data || "Stream error"
          } catch {
            streamErrorMessage = data || "Stream error"
          }
          continue
        }

        if (!data) continue

        try {
          const payload = JSON.parse(data) as unknown
          const chunk = extractOllamaChunk(payload)
          if (chunk.type === "thinking" && chunk.text) {
            onDelta(chunk.text, "thinking")
          } else if (chunk.type === "answer" && chunk.text) {
            onDelta(chunk.text, "answer")
          }
        } catch {
          onError("Invalid JSON in stream")
          return
        }
      }
    }

    if (streamErrorMessage) {
      onError(streamErrorMessage)
      return
    }
    onDone()
  } catch (e) {
    const err = e as { name?: string; message?: string }
    if (err.name === "AbortError") {
      onDone()
      return
    }
    onError(err.message ?? "Network error")
  }
}
