const multer = require("multer");
const { s3Upload } = require("./awsS3Bucket");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const files = ['image/jpeg', 'application/pdf', 'image/png', 'image/jpg', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ]
  if (files.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

// ["image", "jpeg"]

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 52428800, files: 5 },
});