const Razorpay = require('razorpay');

let instance = null;

function getRazorpayInstance() {
  if (instance) return instance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      'Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env'
    );
  }

  instance = new Razorpay({ key_id, key_secret });
  return instance;
}

module.exports = getRazorpayInstance;
