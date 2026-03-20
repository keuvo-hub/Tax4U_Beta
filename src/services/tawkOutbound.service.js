const logger = require("../utils/logger");

class TawkOutboundService {
  async sendMessage(payload, io) {
    const { chatId, message } = payload;

    logger.info("Tawk outbound request received", {
      source: "tawk-outbound",
      chatId,
      message,
    });

    if (!io) {
      logger.error("Socket.io instance not available", {
        source: "tawk-outbound",
      });

      return {
        ok: false,
        stage: "outbound-socket-missing",
        message: "Socket.io instance not available",
      };
    }

    const outboundEvent = {
      chatId,
      message,
      createdAt: new Date().toISOString(),
    };

    io.emit("tawk:outbound-message", outboundEvent);

    logger.info("Tawk outbound socket emitted", {
      source: "tawk-outbound",
      outboundEvent,
    });

    return {
      ok: true,
      stage: "outbound-socket-emitted",
      provider: "internal-io",
      chatId,
      message: "Outbound emitted to socket",
    };
  }
}

module.exports = new TawkOutboundService();
