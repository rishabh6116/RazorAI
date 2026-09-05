const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    source: {
      type: String,
      enum: ['manual', 'ai_recommendation', 'upsell', 'cross_sell'],
      default: 'manual',
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    aiRecommendedRevenue: { type: Number, default: 0 }, // revenue from ai_recommendation/upsell/cross_sell items
    upsellRevenue: { type: Number, default: 0 },
    crossSellRevenue: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
