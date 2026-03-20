const express = require("express");
const router = express.Router();
const {
    createPayment_method, getOnePayment_method, updatePayment_method
} = require('../controllers/payment_methods');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createPayment_method);
// put 
router.put('/update', protect, updatePayment_method);
// get
router.get('/get-all', getOnePayment_method);

// module exports
module.exports = router;