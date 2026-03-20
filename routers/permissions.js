const express = require("express");
const router = express.Router();
const { 
    createPermission,
    getAllPermission,
    getOnePermission,
    updatePermission,
    deletePermission
} = require('../controllers/permissions');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createPermission);
// put 
router.put('/update', protect, updatePermission);
// get
router.get('/get-all', getAllPermission);
router.get('/get-one', getOnePermission);
// delete
router.delete('/delete', protect, deletePermission);

// module exports
module.exports = router;