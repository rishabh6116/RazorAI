const crypto = require('crypto');
const getRazorpayInstance = require('../config/razorpay');

/**
 * Creates a Razorpay order for the given amount (in paise).
 * amountInRupees: number - total in INR
 */
async function createOrder({ amountInRupees, receipt }) {
  const razorpay = getRazorpayInstance();
  const amountInPaise = Math.round(amountInRupees * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
    payment_capture: 1,
  });

  return order;
}

/**
 * Verifies the Razorpay payment signature using HMAC SHA256.
 * This MUST happen on the backend. Never trust the frontend for payment status.
 */
function verifySignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET missing on server');
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

module.exports = { createOrder, verifySignature };
