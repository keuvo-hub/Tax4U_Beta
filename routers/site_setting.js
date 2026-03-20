const express = require("express");
const router = express.Router();
const {
    createSite_setting, getAllSite_setting, getOneSite_setting, updateSite_setting, deleteSite_setting, update
} = require('../controllers/site_setting');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createSite_setting);
router.post('/edit', protect, update);
// put 
router.put('/update', protect, updateSite_setting);
// get
router.get('/get-all', getAllSite_setting);
router.get('/get-one', getOneSite_setting);
// delete
router.delete('/delete', protect, deleteSite_setting);

// module exports
module.exports = router;