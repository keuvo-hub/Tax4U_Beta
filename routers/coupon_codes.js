const express = require("express");
const router = express.Router();
const { 
    createCouponCode, 
    deleteCouponCode, 
    getAllCouponCode, 
    getOneCouponCode, 
    updateCouponCode 
} = require('../controllers/coupon_codes');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createCouponCode);
// put
router.put('/update', protect, updateCouponCode);
// get
router.get('/get-all', protect, getAllCouponCode);
router.get('/get-one', protect, getOneCouponCode);
// delete
router.delete('/delete', protect, deleteCouponCode);

// module exports
module.exports = router;