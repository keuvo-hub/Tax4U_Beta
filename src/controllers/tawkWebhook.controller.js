const tawkWebhookService = require("../services/tawkWebhook.service");
const { validateAndNormalizeTawkPayload } = require("../validators/tawkWebhook.validator");
const logger = require("../utils/logger");

async function handleTawkWebhook(req, res) {
  logger.info("Tawk webhook received", {
    source: "tawk-webhook",
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  const { isValid, errors, normalized } = validateAndNormalizeTawkPayload(req.body);

  if (!isValid) {
    logger.warn("Tawk webhook payload validation failed", {
      source: "tawk-webhook",
      errors,
      body: req.body,
    });

    return res.status(200).json({
      ok: true,
      message: "Webhook received but payload validation failed.",
      errors,
    });
  }

  try {
    const result = await tawkWebhookService.processIncomingMessage(normalized);

    logger.info("Tawk webhook processed successfully", {
      source: "tawk-webhook",
      chatId: normalized.chatId,
    });

    return res.status(200).json({
      ok: true,
      message: "Webhook processed successfully.",
      data: result,
    });
  } catch (error) {
    logger.error("Tawk webhook processing error", {
      source: "tawk-webhook",
      errorMessage: error.message,
      stack: error.stack,
    });

    return res.status(200).json({
      ok: true,
      message: "Webhook received, internal processing error logged.",
    });
  }
}

module.exports = {
  handleTawkWebhook,
};
