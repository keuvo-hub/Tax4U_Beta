const levels = { info: "INFO", warn: "WARN", error: "ERROR" };

function buildLog(level, message, meta = {}) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  });
}

const logger = {
  info(message, meta = {}) {
    console.log(buildLog(levels.info, message, meta));
  },

  warn(message, meta = {}) {
    console.warn(buildLog(levels.warn, message, meta));
  },

  error(message, meta = {}) {
    console.error(buildLog(levels.error, message, meta));
  },
};

module.exports = logger;
