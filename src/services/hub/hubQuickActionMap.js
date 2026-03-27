const HUB_QUICK_ACTION_MAP = {
  find_service: "find_service",
  upload_docs: "upload_docs",
  spanish: "Prefiero continuar en español",
};

function resolveQuickAction(action) {
  if (!action) return null;
  return HUB_QUICK_ACTION_MAP[action] || null;
}

module.exports = {
  HUB_QUICK_ACTION_MAP,
  resolveQuickAction,
};
