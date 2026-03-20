const express = require("express");
const router = express.Router();
const { 
    createProvince,
    getOneProvince,
    getAllProvince,
    deleteProvince,
    updateProvince,
    getAllProvinceByRole
} = require('../controllers/provinces');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createProvince);
// put 
router.put('/update', protect, updateProvince);
// get
router.get('/get-all', protect, getAllProvince);
router.get('/get-one', protect, getOneProvince);
router.get('/get-all-according-to-user-role', protect, getAllProvinceByRole);
// delete
router.delete('/delete', protect, deleteProvince);

// module exports
module.exports = router;