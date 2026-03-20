const express = require("express");
const router = express.Router();
const {
    createContactUs, getAllContactUs, getOneContactUs, updateContactUs, deleteContactUs
} = require('../controllers/contact_us');
const { protect } = require('../middleware/authProtect');

// post 
router.post('/create', createContactUs);
// put 
router.put('/update', protect, updateContactUs);
// get
router.get('/get-all', getAllContactUs);
router.get('/get-one', getOneContactUs);
// delete
router.delete('/delete', protect, deleteContactUs);

// module exports
module.exports = router;