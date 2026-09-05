const asyncHandler = require('../utils/asyncHandler');
const razorpayService = require('../services/razorpayService');
const agentTools = require('../services/agentTools');
const Order = require('../models/Order');
const Recommendation = require('../models/Recommendation');
const Cart = require('../models/Cart');

// STEP 1: Create a Razorpay order for the session's current cart.
// The amount is computed on the SERVER from the DB cart - never trust a client-sent amount.
const createOrder = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'sessionId is required' });
  }

  const cartSummary = await agentTools.analyzeCart({ sessionId });
  if (cartSummary.itemCount === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const razorpayOrder = await razorpayService.createOrder({
    amountInRupees: cartSummary.subtotal,
    receipt: `rcpt_${sessionId}_${Date.now()}`,
  });

  // Persist a "created" order record so we can reconcile it after payment.
  const items = cartSummary.items.map((i) => ({
    product: i.productId,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    source: i.source,
  }));

  const aiRecommendedRevenue = items
    .filter((i) => i.source !== 'manual')
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
  const upsellRevenue = items
    .filter((i) => i.source === 'upsell')
    .reduce((sum, i) => sum + i.price * i.quantity, 0);
  const crossSellRevenue = items
    .filter((i) => i.source === 'cross_sell')
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    sessionId,
    items,
    subtotal: cartSummary.subtotal,
    aiRecommendedRevenue,
    upsellRevenue,
    crossSellRevenue,
    total: cartSummary.subtotal,
    razorpayOrderId: razorpayOrder.id,
    status: 'created',
  });

  res.json({
    success: true,
    orderId: order._id,
    razorpayOrder,
    keyId: process.env.RAZORPAY_KEY_ID, // public key id is safe to expose to the frontend
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  });
});

// STEP 2: Verify payment signature. This is the ONLY source of truth for payment success.
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
  }

  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const isValid = razorpayService.verifySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    order.status = 'failed';
    await order.save();
    return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
  }

  order.status = 'paid';
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  await order.save();

  // Mark AI recommendations that contributed to this order as converted, for the dashboard.
  const aiProductIds = order.items.filter((i) => i.source !== 'manual').map((i) => i.product);
  if (aiProductIds.length > 0) {
    await Recommendation.updateMany(
      { sessionId: order.sessionId, product: { $in: aiProductIds }, convertedToOrder: false },
      [
        {
          $set: {
            convertedToOrder: true,
            revenue: {
              $let: {
                vars: { dummy: 1 },
                in: '$revenue', // revenue set below individually where price known
              },
            },
          },
        },
      ]
    ).catch(() => {}); // best-effort; core payment flow must not fail because of analytics
  }

  // Clear the cart after a successful, verified payment.
  await Cart.findOneAndUpdate({ sessionId: order.sessionId }, { items: [] });

  res.json({ success: true, order });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

module.exports = { createOrder, verifyPayment, getOrder };
