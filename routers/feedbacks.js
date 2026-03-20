const express = require("express");
const router = express.Router();
const {
    createFeedback, getAllFeedback, getOneFeedback, updateFeedback, deleteFeedback, getUserFeedback
} = require('../controllers/feedbacks');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createFeedback);
// put 
router.put('/update', protect, updateFeedback);
// get
router.get('/get-all', getAllFeedback);
router.get('/get-one', getOneFeedback);
router.get('/get-user-feedback', protect, getUserFeedback);
// delete
router.delete('/delete', protect, deleteFeedback);

// module exports
module.exports = router;