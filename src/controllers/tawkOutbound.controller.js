const tawkOutboundService = require("../services/tawkOutbound.service");
const logger = require("../utils/logger");

async function handleTawkOutbound(req, res) {
  logger.info("Tawk outbound endpoint hit", {
    source: "tawk-outbound",
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  const { chatId, message } = req.body;

  if (!chatId || !message) {
    logger.warn("Tawk outbound validation failed", {
      source: "tawk-outbound",
      body: req.body,
    });

    return res.status(400).json({
      ok: false,
      message: "chatId and message are required",
    });
  }

  try {
    const io = req.app.get("io");
    const result = await tawkOutboundService.sendMessage({ chatId, message }, io);

    logger.info("Tawk outbound processed", {
      source: "tawk-outbound",
      chatId,
      stage: result.stage,
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error("Tawk outbound error", {
      source: "tawk-outbound",
      errorMessage: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      ok: false,
      message: "Outbound processing error",
    });
  }
}

module.exports = {
  handleTawkOutbound,
};
