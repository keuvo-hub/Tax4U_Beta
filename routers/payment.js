const express = require("express");
const router = express.Router();
const {
    paymentHistories
} = require('../controllers/payment');
const { protect } = require('../middleware/authProtect');

// get
router.get('/list', protect, paymentHistories);

// module exports
module.exports = router;