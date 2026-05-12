require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authMiddleware = require('./middleware/auth');
const ollamaRoutes = require('./routes/ollama');

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key'],
  })
);
app.use(express.json({ limit: '10mb' }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100, // 100 requests per 15 minutes
  })
);

// Health check
app.get('/', (req, res) => {
  res.send('Ollama Proxy Running 🚀');
});

// Protected routes
app.use('/api/ollama', authMiddleware, ollamaRoutes);

const PORT = process.env.PORT || 5000;
console.log("🚀 ~ process.env.PORT:", process.env.PORT)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});