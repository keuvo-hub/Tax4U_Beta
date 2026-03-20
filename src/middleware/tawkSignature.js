const crypto = require("crypto");
const logger = require("../utils/logger");

function safeCompareHex(a, b) {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");

    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch (error) {
    return false;
  }
}

function verifyTawkSignature(req, res, next) {
  try {
    const signature = req.headers["x-tawk-signature"];
    const secret = process.env.TAWK_WEBHOOK_SECRET;

    if (!signature || !secret || !req.rawBody) {
      logger.warn("Tawk signature missing or raw body unavailable", {
        source: "tawk-webhook",
      });

      return res.status(401).json({
        ok: false,
        message: "Unauthorized: missing signature",
      });
    }

    const computed = crypto
      .createHmac("sha1", secret)
      .update(req.rawBody)
      .digest("hex");

    if (!safeCompareHex(computed, signature)) {
      logger.warn("Tawk signature mismatch", {
        source: "tawk-webhook",
        received: signature,
      });

      return res.status(401).json({
        ok: false,
        message: "Unauthorized: invalid signature",
      });
    }

    next();
  } catch (error) {
    logger.error("Error verifying Tawk signature", {
      source: "tawk-webhook",
      errorMessage: error.message,
    });

    return res.status(500).json({
      ok: false,
      message: "Internal error verifying signature",
    });
  }
}

module.exports = {
  verifyTawkSignature,
};
