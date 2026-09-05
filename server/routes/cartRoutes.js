const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
} = require('../controllers/cartController');

router.get('/:sessionId', getCart);
router.post('/:sessionId/items', addItem);
router.delete('/:sessionId/items/:productId', removeItem);
router.patch('/:sessionId/items/:productId', updateQuantity);
router.delete('/:sessionId', clearCart);

module.exports = router;
