const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    toolCalls: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, _id: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    messages: { type: [MessageSchema], default: [] },
    extractedIntent: {
      category: String,
      budget: Number,
      useCase: String,
      requirements: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
