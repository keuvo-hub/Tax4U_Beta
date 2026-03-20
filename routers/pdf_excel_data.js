const express = require("express");
const router = express.Router();
const {
    createPdf_excel_data, getOnePdf_excel_data, getAllPdf_excel_data, deletePdf_excel_data, updatePdf_excel_data
} = require('../controllers/pdf_excel_data');

const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createPdf_excel_data);
// put 
router.put('/update', protect, updatePdf_excel_data);
// get
router.get('/get-all', getAllPdf_excel_data);
router.get('/get-one', getOnePdf_excel_data);
// delete
router.delete('/delete', protect, deletePdf_excel_data);

// module exports
module.exports = router;