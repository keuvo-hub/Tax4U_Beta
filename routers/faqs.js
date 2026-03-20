const express = require("express");
const router = express.Router();
const {
    createFaq, getAllFaq, getOneFaq, updateFaq, deleteFaq
} = require('../controllers/faqs');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', createFaq);
// put 
router.put('/update', protect, updateFaq);
// get
router.get('/get-all', getAllFaq);
router.get('/get-one', getOneFaq);
// delete
router.delete('/delete', protect, deleteFaq);

// module exports
module.exports = router;