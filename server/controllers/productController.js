const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');

const getProducts = asyncHandler(async (req, res) => {
  const { category, maxPrice, minPrice, search, sort } = req.query;
  const query = {};
  if (category) query.category = category;
  if (maxPrice || minPrice) {
    query.price = {};
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (minPrice) query.price.$gte = Number(minPrice);
  }
  if (search) query.$text = { $search: search };

  let sortStage = { rating: -1 };
  if (sort === 'price_asc') sortStage = { price: 1 };
  if (sort === 'price_desc') sortStage = { price: -1 };

  const products = await Product.find(query).sort(sortStage).lean();
  res.json({ success: true, count: products.length, products });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
});

module.exports = { getProducts, getProductById, getCategories };
