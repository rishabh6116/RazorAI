const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Laptops',
        'Smartphones',
        'Accessories',
        'Headphones',
        'Keyboards',
        'Mice',
        'Monitors',
        'Laptop Bags',
        'Stands',
      ],
      index: true,
    },
    price: { type: Number, required: true, index: true },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    image: { type: String, required: true },
    specs: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: { type: [String], default: [] }, // e.g. ["coding","gaming","budget"]
    complementaryCategories: { type: [String], default: [] }, // for cross-sell
    stock: { type: Number, default: 50 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
