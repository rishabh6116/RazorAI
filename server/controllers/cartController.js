const asyncHandler = require('../utils/asyncHandler');
const agentTools = require('../services/agentTools');
const Cart = require('../models/Cart');

const getCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const cart = await agentTools.analyzeCart({ sessionId });
  res.json({ success: true, cart });
});

const addItem = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { productId, quantity, source } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required' });
  }
  const result = await agentTools.addToCart({
    sessionId,
    productId,
    quantity: quantity || 1,
    source: source || 'manual',
  });
  res.json(result);
});

const removeItem = asyncHandler(async (req, res) => {
  const { sessionId, productId } = req.params;
  const result = await agentTools.removeFromCart({ sessionId, productId });
  res.json(result);
});

const updateQuantity = asyncHandler(async (req, res) => {
  const { sessionId, productId } = req.params;
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ success: false, message: 'quantity must be >= 1' });
  }
  const cart = await Cart.findOne({ sessionId });
  if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

  item.quantity = quantity;
  await cart.save();

  const updated = await agentTools.analyzeCart({ sessionId });
  res.json({ success: true, cart: updated });
});

const clearCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  await Cart.findOneAndUpdate({ sessionId }, { items: [] }, { upsert: true });
  res.json({ success: true, cart: await agentTools.analyzeCart({ sessionId }) });
});

module.exports = { getCart, addItem, removeItem, updateQuantity, clearCart };
