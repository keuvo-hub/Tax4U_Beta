const logger = require("../utils/logger");

class TawkWebhookService {
  async processIncomingMessage(payload) {
    const { chatId, message, visitor, timestamp } = payload;

    logger.info("Tawk message received", {
      source: "tawk-webhook",
      chatId,
      visitor,
      timestamp,
    });

    const internalMessage = {
      source: "tawk.to",
      chatId,
      message,
      visitor,
      timestamp,
      receivedAt: new Date().toISOString(),
    };

    logger.info("Internal message created", {
      source: "tawk-webhook",
      internalMessage,
    });

    // TODO: PEGAR API OPENAI AQUÍ
    // Aquí irá:
    // - Clone 0 (router conversacional)
    // - procesamiento con OpenAI
    // - respuesta estructurada

    const placeholder = {
      handled: false,
      reason: "OpenAI not connected yet",
    };

    logger.info("AI placeholder skipped", {
      chatId,
      placeholder,
    });

    return {
      ok: true,
      chatId,
    };
  }
}

module.exports = new TawkWebhookService();
