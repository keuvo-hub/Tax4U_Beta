const {
  sanitizeAuthUser,
  sanitizeActiveTaxFile,
} = require("./hubIdentitySchema");
const { resolveTrigger } = require("./hubTriggerMap");
const { resolveQuickAction } = require("./hubQuickActionMap");

function buildHubContext(payload = {}, enriched = {}) {
  const authUser = sanitizeAuthUser(
    enriched.authUser || payload.authUser || {}
  );

  const activeTaxFile = sanitizeActiveTaxFile(
    enriched.activeTaxFile || payload.activeTaxFile || {}
  );

  return {
    authUser: authUser.userSn ? authUser : enriched.authUser || payload.authUser || {},
    activeTaxFile,
    conversationState: enriched.conversationState || null,
    derived: enriched.derived || {},
    stack: payload.stack || null,
    surface: payload.surface || payload.channel || "unknown",
    trigger: resolveTrigger(payload.trigger),
    session: payload.session || {},
    quickAction: resolveQuickAction(payload.quickAction),
    channel: payload.channel || "unknown",
    message: payload.message || "",
    history: Array.isArray(payload.history) ? payload.history : [],
  };
}

module.exports = {
  buildHubContext,
};
