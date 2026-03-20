const AWS = require("aws-sdk");
const crypto = require("crypto");

const s3 = new AWS.S3({
  endpoint: process.env.AWS_ENDPOINT,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "auto",
  signatureVersion: "v4",
});

exports.s3Upload = async (files = [], email) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const randNumber = crypto.randomBytes(8).toString("hex");
  const publicBaseUrl = process.env.PUBLIC_R2_BASE_URL;

  const uploads = await Promise.all(
    files.map(async (file) => {
      const key = `${process.env.WEBSITE_NAME || "taxstick"}-storage/${email}/${randNumber}-${file.originalname}`;

      const result = await s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      return {
        Location: publicBaseUrl ? `${publicBaseUrl}/${key}` : result.Location,
        Key: key,
      };
    })
  );

  return uploads;
};
