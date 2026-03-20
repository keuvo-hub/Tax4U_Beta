function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function pick(...values) {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function normalizeVisitor(v) {
  if (!isObject(v)) {
    return { id: null, name: null, email: null, phone: null };
  }

  return {
    id: pick(v.id, v.visitorId),
    name: pick(v.name),
    email: pick(v.email),
    phone: pick(v.phone),
  };
}

function normalizeTimestamp(t) {
  if (!t) return new Date().toISOString();

  const d = new Date(t);
  if (isNaN(d.getTime())) return new Date().toISOString();

  return d.toISOString();
}

function validateAndNormalizeTawkPayload(p) {
  if (!isObject(p)) {
    return {
      isValid: false,
      errors: ["Invalid payload"],
      normalized: null,
    };
  }

  const chatId = pick(p.chatId, p.chat_id, p.id, p.conversationId);
  const message = pick(p.message, p.text, p.body, p.content);
  const visitor = normalizeVisitor(p.visitor || p.customer || p.contact);
  const timestamp = normalizeTimestamp(p.timestamp || p.createdAt);

  const errors = [];

  if (!chatId) errors.push("chatId missing");
  if (!message) errors.push("message missing");

  return {
    isValid: errors.length === 0,
    errors,
    normalized: {
      chatId,
      message,
      visitor,
      timestamp,
      rawPayload: p,
    },
  };
}

module.exports = {
  validateAndNormalizeTawkPayload,
};
