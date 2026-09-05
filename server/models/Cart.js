const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtAdd: { type: Number, required: true },
    source: {
      type: String,
      enum: ['manual', 'ai_recommendation', 'upsell', 'cross_sell'],
      default: 'manual',
    },
  },
  { _id: true }
);

const CartSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
