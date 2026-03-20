const express = require("express");
const router = express.Router();
const {
    createUser_form_controller, getAllUser_form_controller, getOneUser_form_controller, 
    updateUser_form_controller, deleteUser_form_controller, getSpecificUserRoleFormData
} = require('../controllers/userFormControllers');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createUser_form_controller);
// put 
router.put('/update', protect, updateUser_form_controller);
// get
router.get('/get-all', getAllUser_form_controller);
router.get('/get-one', getOneUser_form_controller);
router.get('/get-specific-role-data', getSpecificUserRoleFormData);
// delete
router.delete('/delete', protect, deleteUser_form_controller);

// module exports
module.exports = router;