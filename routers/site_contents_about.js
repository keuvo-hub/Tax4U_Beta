const express = require("express");
const router = express.Router();
const {
    createSite_content_about, getOneSite_content_about, getAllSite_content_about,
    updateSite_content_about, deleteSite_content_about, updateArraycontent_about, deleteFromArrayContentAbout
} = require('../controllers/site_contents_about');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createSite_content_about);
// put 
router.put('/update', protect, updateSite_content_about);
router.put('/update-array', protect, updateArraycontent_about);
router.put('/update-delete-content-about', protect, deleteFromArrayContentAbout);
// get
router.get('/get-all', getAllSite_content_about);
router.get('/get-one', getOneSite_content_about);
// delete
router.delete('/delete', protect, deleteSite_content_about);

// module exports
module.exports = router;