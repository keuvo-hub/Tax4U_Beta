const express = require("express");
const router = express.Router();
const { 
    createStudentFormFiled,
    getOneStudentFormField,
    getAllStudentFormField,
    updateStudentFormFiled,
    deleteStudentFormFiled,
    getAllFielteredStudentFormField
} = require('../controllers/student_form_fields');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createStudentFormFiled);
// put 
router.put('/update', protect, updateStudentFormFiled);
// get
router.get('/get-all', protect, getAllStudentFormField);
router.get('/get-all-fieltered-data', protect, getAllFielteredStudentFormField);
router.get('/get-one', protect, getOneStudentFormField);
// delete
router.delete('/delete', protect, deleteStudentFormFiled);

// module exports
module.exports = router;