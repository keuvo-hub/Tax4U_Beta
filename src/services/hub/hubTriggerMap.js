const HUB_TRIGGER_MAP = {
  callchat0: "callchat0",
  callchat1: "callchat1",
  case_closed: "case_closed",
};

function resolveTrigger(trigger) {
  if (!trigger) return null;
  return HUB_TRIGGER_MAP[trigger] || trigger;
}

module.exports = {
  resolveTrigger,
};
