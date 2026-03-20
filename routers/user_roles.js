const express = require("express");
const router = express.Router();
const {
    createUserRole, getOneUserRole, getAllUserRole, updateUserRole, deleteUserRole, getAllUserRoleExceptAdmin, getOneUserRoleByRoleName, setCouponUserRole
} = require('../controllers/user_roles');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createUserRole);
// put 
router.put('/update', protect, updateUserRole);
router.put('/coupon-assign', protect, setCouponUserRole);
// get
router.get('/get-all', getAllUserRole);
router.get('/get-all-except-admin', getAllUserRoleExceptAdmin);
router.get('/get-one', getOneUserRole);
router.get('/get-one-user-role', getOneUserRoleByRoleName);
// delete
router.delete('/delete', protect, deleteUserRole);

// module exports
module.exports = router;