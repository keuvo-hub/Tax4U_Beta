const fs = require('fs');
const path = require('path');
const { s3Upload } = require('../utils/awsS3Bucket');
const Taxfile = require('../models/taxfile');

exports.uploadFiles = async (req, res, next) => {
  const { email } = res.locals.user;

  try {
    const results = await s3Upload(req.files, email);

    // 🔥 actualizar estado del caso automáticamente
    if (req.body.taxFileId) {
      await Taxfile.findByIdAndUpdate(req.body.taxFileId, {
        $set: {
          'case_context.status': 'analyzing_documents'
        }
      });
    }

    return res.status(200).json({
      status: true,
      message: 'File uploaded successfully!',
      url: results?.[0]?.Location || null
    });

  } catch (error) {
    fs.appendFileSync(
      path.join(__dirname, '../upload-error.log'),
      `\n[${new Date().toISOString()}]\nMESSAGE: ${error.message}\nSTACK: ${error.stack || 'no stack'}\n`
    );

    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};
