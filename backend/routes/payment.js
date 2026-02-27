const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create Razorpay order (returns order and key id)
router.post('/create-order', paymentController.createRazorpayOrder);

// Webhook - must receive raw body to verify signature
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.razorpayWebhook);

module.exports = router;
