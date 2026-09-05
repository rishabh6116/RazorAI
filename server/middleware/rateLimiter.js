const rateLimit = require('express-rate-limit');

// Basic protection for the AI endpoints so a single client can't hammer Gemini/DB.
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a moment and try again.',
  },
});

const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter, generalRateLimiter };
