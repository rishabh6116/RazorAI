const asyncHandler = require('../utils/asyncHandler');
const Conversation = require('../models/Conversation');
const { runAgent } = require('../services/geminiService');

const chat = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'sessionId and message are required' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ success: false, message: 'Message too long (max 1000 chars)' });
  }

  let conversation = await Conversation.findOne({ sessionId });
  if (!conversation) {
    conversation = new Conversation({ sessionId, messages: [] });
  }

  const history = conversation.messages.map((m) => ({ role: m.role, content: m.content }));

  let agentResult;
  try {
    agentResult = await runAgent({ message, history, sessionId });
  } catch (err) {
    console.error('Agent error:', err.message);
    return res.status(502).json({
      success: false,
      message:
        'The AI assistant is currently unavailable. Please check that GEMINI_API_KEY is configured on the server.',
      error: err.message,
    });
  }

  conversation.messages.push({ role: 'user', content: message });
  conversation.messages.push({
    role: 'assistant',
    content: agentResult.text,
    toolCalls: agentResult.toolCalls,
  });
  await conversation.save();

  res.json({
    success: true,
    reply: agentResult.text,
    toolCalls: agentResult.toolCalls,
  });
});

const getHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const conversation = await Conversation.findOne({ sessionId }).lean();
  res.json({ success: true, messages: conversation ? conversation.messages : [] });
});

const resetConversation = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  await Conversation.findOneAndUpdate({ sessionId }, { messages: [] }, { upsert: true });
  res.json({ success: true });
});

module.exports = { chat, getHistory, resetConversation };
