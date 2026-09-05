const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Guest User' },
    email: { type: String },
    sessionId: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
