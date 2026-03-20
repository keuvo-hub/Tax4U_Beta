const express = require("express");
const router = express.Router();
const {
    createTaxfile,
    getAllTaxfile,
    getOneTaxfile,
    updateTaxfile,
    deleteTaxfile,
    getAllByUserwiseTaxfile,
    updateManyTaxfile,
    fileUpload,
    completeTaxFileFromAC,
    updateReview,
    fetchTaxFiles,
    fetchTaxFilesData,
    fetchTaxFilesDataForExcel,
    fetchTaxFileDetails,
    getTaxfilesStatusAccountant, transferTaxfleToAnotherAccountant
} = require('../controllers/taxfiles');
const { protect } = require('../middleware/authProtect');
const { upload } = require("../utils/fileProcess");

// post 
router.post('/create', protect, createTaxfile);
router.post('/update-many', protect, updateManyTaxfile);
// // put 
router.put('/update', protect, updateTaxfile);
router.put('/update-review', protect, updateReview);
// get
router.get('/get-all', getAllTaxfile);
router.get('/get-all-by-userwise', protect, getAllByUserwiseTaxfile);
router.get('/complete-file-from-ac', protect, completeTaxFileFromAC);
router.get('/accountant-dashboard', protect, getTaxfilesStatusAccountant);
router.get('/get-one', getOneTaxfile);
router.get('/', fetchTaxFiles);
router.get('/file-data', fetchTaxFilesData);
router.post('/list-for-excel', protect, fetchTaxFilesDataForExcel);
router.get('/details', fetchTaxFileDetails);
router.post('/upload', protect, upload.array('file'), fileUpload)
// // delete
router.delete('/delete', protect, deleteTaxfile);
router.post('/transfer-between-accountant', protect, transferTaxfleToAnotherAccountant);

// module exports
module.exports = router;