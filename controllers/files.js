const { generateSHA256FromBuffer } = require("../services/clone2/utils/hash");
const Taxfile = require('../models/taxfile');
const { processDocument } = require('../services/clone2/documentProcessor.service');
const { s3Upload } = require('../utils/awsS3Bucket');

exports.uploadFiles = async (req, res, next) => {
    const { email } = res.locals.user;
    const { taxFileId } = req.body;

    try {
        const results = await s3Upload(req.files, email);
// SHA256 hash
const fileBuffer = req.files[0].buffer;
const documentHash = generateSHA256FromBuffer(fileBuffer);


        const documentResult = await processDocument({
            taxFileId,
            documentId: `doc_${Date.now()}`,
            fileUrl: results[0].Location,
            fileType: req.files[0].mimetype,
            documentHash: documentHash,
            uploadContext: {
                surface: 'chat1',
                source: 'user_upload'
            }
        });

        await Taxfile.findByIdAndUpdate(taxFileId, {
            $push: {
                "case_context.document_context.documents": documentResult
            },
            $set: {
                "case_context.document_context.lastProcessedAt": new Date()
            }
        });

        return res.status(200).json({
            status: true,
            message: 'File uploaded successfully!',
            fileUrl: results[0].Location,
            fileType: req.files[0].mimetype,
            originalName: req.files[0].originalname,
            size: req.files[0].size,
            taxFileId,
            document_result: documentResult
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message
        });
    }
};
