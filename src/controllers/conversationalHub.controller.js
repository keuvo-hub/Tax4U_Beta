const conversationalHubService = require("../services/conversationalHub.service");
const logger = require("../utils/logger");

async function handleConversationalHubMessage(req, res) {
  logger.info("Conversational Hub endpoint hit", {
    source: "conversational-hub",
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  const payload = req.body || {};

if (res.locals?.user) {
  payload.authUser = {
    userSn: res.locals.user.id,
    email: res.locals.user.email || null,
  };
}

const { message } = payload;

if (!message) {
    logger.warn("Conversational Hub validation failed", {
      source: "conversational-hub",
      body: payload,
    });

    return res.status(400).json({
      ok: false,
      message: "message is required",
    });
  }

  try {
    const result = await conversationalHubService.processMessage(payload);

    logger.info("Conversational Hub processed", {
      source: "conversational-hub",
      channel: payload.channel,
      surface: payload.surface || null,
      trigger: payload.trigger || null,
      stage: result.stage,
      stack: result.stack || null,
    });

    return res.status(200).json(result);
  } catch (error) {
    logger.error("Conversational Hub error", {
      source: "conversational-hub",
      errorMessage: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      ok: false,
      message: "Conversational Hub processing error",
    });
  }
}

module.exports = {
  handleConversationalHubMessage,
};
