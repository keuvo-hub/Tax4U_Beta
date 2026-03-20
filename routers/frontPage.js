const express = require("express");
const router = express.Router();
const { 
   createFrontPage,
   getOneFrontPage,
    getAllFrontPage,
    deleteFrontPage,
    updateFrontPage,
    getHomePageFromDB
} = require('../controllers/frontPage');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create',protect, createFrontPage);
// put 
router.put('/update', protect, updateFrontPage);
// get
router.get('/get-all',  getAllFrontPage);
router.get('/get-one', getOneFrontPage);
router.get('/home', getHomePageFromDB);
// delete
router.delete('/delete', protect, deleteFrontPage);

// module exports
module.exports = router;