const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Recommendation = require('../models/Recommendation');
const razorpayService = require('./razorpayService');

/**
 * All functions here are "tools" the AI agent can call.
 * Each returns a plain JSON-serializable object so it can be fed
 * back into the Gemini function-calling loop as a tool result.
 */

async function searchProducts({ category, maxPrice, minPrice, keywords, tags, limit = 6 }) {
  const query = {};
  if (category) query.category = new RegExp(`^${category}$`, 'i');
  if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
  if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
  if (tags && tags.length) query.tags = { $in: tags.map((t) => t.toLowerCase()) };

  let mongoQuery = Product.find(query);

  if (keywords) {
    mongoQuery = Product.find({ ...query, $text: { $search: keywords } });
  }

  const products = await mongoQuery.sort({ rating: -1 }).limit(limit).lean();

  // Fallback: if text search / strict filters found nothing, loosen to category+price only
  if (products.length === 0 && (category || maxPrice)) {
    const looseQuery = {};
    if (category) looseQuery.category = new RegExp(`^${category}$`, 'i');
    if (maxPrice) looseQuery.price = { $lte: Number(maxPrice) * 1.15 }; // 15% flex
    const fallback = await Product.find(looseQuery).sort({ rating: -1 }).limit(limit).lean();
    return { count: fallback.length, products: fallback };
  }

  return { count: products.length, products };
}

async function getProductDetails({ productId }) {
  const product = await Product.findById(productId).lean();
  if (!product) return { found: false };
  return { found: true, product };
}

async function recommendProducts({ category, maxPrice, useCase, limit = 1 }) {
  const query = {};
  if (category) query.category = new RegExp(`^${category}$`, 'i');
  if (maxPrice) query.price = { $lte: Number(maxPrice) };
  if (useCase) query.tags = { $in: [String(useCase).toLowerCase()] };

  let candidates = await Product.find(query).sort({ rating: -1 }).limit(limit).lean();

  if (candidates.length === 0) {
    // relax use-case tag filter
    const relaxed = { ...query };
    delete relaxed.tags;
    candidates = await Product.find(relaxed).sort({ rating: -1 }).limit(limit).lean();
  }

  return { recommended: candidates };
}

async function suggestUpsell({ productId, limit = 2 }) {
  const base = await Product.findById(productId).lean();
  if (!base) return { upsells: [] };

  // Upsell = same category, higher price, higher (or equal) rating
  const upsells = await Product.find({
    category: base.category,
    price: { $gt: base.price },
    _id: { $ne: base._id },
  })
    .sort({ rating: -1, price: 1 })
    .limit(limit)
    .lean();

  return { upsells };
}

async function suggestCrossSell({ productId, limit = 3 }) {
  const base = await Product.findById(productId).lean();
  if (!base) return { crossSells: [] };

  const categories =
    base.complementaryCategories && base.complementaryCategories.length
      ? base.complementaryCategories
      : [];

  if (categories.length === 0) return { crossSells: [] };

  const crossSells = await Product.find({
    category: { $in: categories },
  })
    .sort({ rating: -1 })
    .limit(limit)
    .lean();

  return { crossSells };
}

async function analyzeCart({ sessionId }) {
  const cart = await Cart.findOne({ sessionId }).populate('items.product').lean();
  if (!cart || cart.items.length === 0) {
    return { itemCount: 0, subtotal: 0, items: [] };
  }
  const items = cart.items.map((i) => ({
    productId: i.product?._id,
    name: i.product?.name,
    price: i.priceAtAdd,
    quantity: i.quantity,
    source: i.source,
    lineTotal: i.priceAtAdd * i.quantity,
  }));
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { itemCount: items.length, subtotal, items };
}

async function addToCart({ sessionId, productId, quantity = 1, source = 'manual' }) {
  const product = await Product.findById(productId).lean();
  if (!product) return { success: false, message: 'Product not found' };

  let cart = await Cart.findOne({ sessionId });
  if (!cart) cart = new Cart({ sessionId, items: [] });

  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      priceAtAdd: product.price,
      source,
    });
  }
  await cart.save();

  // Track AI-driven additions for the growth dashboard
  if (source !== 'manual') {
    await Recommendation.create({
      sessionId,
      product: productId,
      type: source === 'ai_recommendation' ? 'primary' : source,
      reason: `Auto-added via ${source}`,
      accepted: true,
    });
  }

  return { success: true, cart: await analyzeCart({ sessionId }) };
}

async function removeFromCart({ sessionId, productId }) {
  const cart = await Cart.findOne({ sessionId });
  if (!cart) return { success: false, message: 'Cart not found' };

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();

  return { success: true, cart: await analyzeCart({ sessionId }) };
}

async function createRazorpayOrder({ sessionId }) {
  const cartSummary = await analyzeCart({ sessionId });
  if (cartSummary.itemCount === 0) {
    return { success: false, message: 'Cart is empty' };
  }
  const order = await razorpayService.createOrder({
    amountInRupees: cartSummary.subtotal,
    receipt: `cart_${sessionId}_${Date.now()}`,
  });
  return { success: true, order, amount: cartSummary.subtotal };
}

module.exports = {
  searchProducts,
  getProductDetails,
  recommendProducts,
  suggestUpsell,
  suggestCrossSell,
  analyzeCart,
  addToCart,
  removeFromCart,
  createRazorpayOrder,
};
