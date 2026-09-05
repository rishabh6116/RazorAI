const express = require('express');
const router = express.Router();
const { chat, getHistory, resetConversation } = require('../controllers/aiController');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.post('/chat', aiRateLimiter, chat);
router.get('/history/:sessionId', getHistory);
router.delete('/history/:sessionId', resetConversation);

module.exports = router;
