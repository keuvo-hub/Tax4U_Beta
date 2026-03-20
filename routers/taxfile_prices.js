const express = require("express");
const router = express.Router();
const { createTaxFilePrice, taxFilePriceGet, deletetaxFilePrice, updateTaxFilePrice, taxFilePriceGetOne, taxFilePriceGetAll, specificTaxPrice } = require('../controllers/taxfile_prices');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', protect, createTaxFilePrice);
// put 
router.put('/update', protect, updateTaxFilePrice);
// get
router.get('/', taxFilePriceGet);
router.get('/get-one', taxFilePriceGetOne);
router.get('/get-all', taxFilePriceGetAll);
router.get('/specific_tax_price', specificTaxPrice);
// delete
router.delete('/', protect, deletetaxFilePrice);

// module exports
module.exports = router;