const express = require("express");
const router = express.Router();
const {
    createService_blog, getAllService_blog, getOneService_blog, updateService_blog, deleteService_blog, updateArraycontent_Home, deleteFromArrayService_blog
} = require('../controllers/service_blogs');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createService_blog);
// put
router.put('/update', protect, updateService_blog);
router.put('/update-array', protect, updateArraycontent_Home);
// get
router.get('/get-all', getAllService_blog);
router.get('/get-one', getOneService_blog);
// delete
router.delete('/delete', protect, deleteService_blog);
router.delete('/delete-from-array', protect, deleteFromArrayService_blog);

// module exports
module.exports = router;