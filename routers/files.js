const express = require("express");
const router = express.Router();
const {
    uploadFiles
} = require('../controllers/files');
const { protect } = require('../middleware/authProtect');
const { upload } = require("../utils/fileProcess");

// const multiUpload = upload.fields([
//   { name: "profile_image", maxCount: 1 },
//   { name: "t2202a_form", maxCount: 1 },
//   { name: "notice_of_assessment", maxCount: 1 },
//   { name: "direct_deposit_form", maxCount: 1 },
//   { name: "drivers_license", maxCount: 1 },
//   { name: "uber_summary_pic", maxCount: 1 },
//   { name: "t4s", maxCount: 10 },
// ]);

// post 
router.post('/upload-aws', protect, upload.any(), uploadFiles);

// // put 
// router.put('/update', protect, updateFaq);

// // get
// router.get('/get-all', getAllFaq);
// router.get('/get-one', getOneFaq);

// // delete
// router.delete('/delete', protect, deleteFaq);



// module exports
module.exports = router;