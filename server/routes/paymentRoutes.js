const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getOrder } = require('../controllers/paymentController');

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/order/:id', getOrder);

module.exports = router;
