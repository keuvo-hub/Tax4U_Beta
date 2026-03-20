const express = require("express");
const router = express.Router();
const {
    createTax_situation, getOneTax_situation, getAllTax_situation, deleteTax_situation, updateTax_situation,
    deleteFromArrayTax_situation, updateArrayTaxSituation
} = require('../controllers/tax_situations');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createTax_situation);
// put 
router.put('/update', protect, updateTax_situation);
router.put('/update-array', protect, updateArrayTaxSituation);
// get
router.get('/get-all', getAllTax_situation);
router.get('/get-one', getOneTax_situation);
// delete
router.delete('/delete', protect, deleteTax_situation);
router.put('/delete-from-array', protect, deleteFromArrayTax_situation);

// module exports
module.exports = router;