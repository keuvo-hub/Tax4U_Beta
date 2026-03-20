const express = require("express");
const router = express.Router();
const { 
    paymentCheckout, paymentStatus, molliePaymentGetaway, molliePaymentCheck,
    razorPayOrder, razorVerification, paypalVerify, verifyPayment
} = require('../controllers/paymentGateway');
const { protect } = require('../middleware/authProtect');

// post -> stripe
router.post('/checkout', protect, paymentCheckout);
// paypal payment current version api
router.post('/paypal-verify', protect, paypalVerify);
// mollie payment getaway
router.post('/mollie-payment',protect, molliePaymentGetaway);
router.get('/webhook', molliePaymentCheck);
// razor pay 
router.post('/razorpay-order', protect, razorPayOrder);
router.post('/razorpay-verify', protect, razorVerification);
// payment verification
router.get("/payment-verification", protect, verifyPayment)

// module exports
module.exports = router;