const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: ['primary', 'upsell', 'cross_sell'],
      required: true,
    },
    reason: { type: String, default: '' },
    accepted: { type: Boolean, default: false }, // set true when user adds it to cart
    convertedToOrder: { type: Boolean, default: false }, // set true when the order is paid
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', RecommendationSchema);
