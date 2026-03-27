const HUB_IDENTITY_FIELDS = {
  authUser: ["userSn", "email", "username", "displayName"],
  activeTaxFile: [
    "id",
    "taxFileId",
    "taxYear",
    "loyaltyReferralCode",
    "caseStatus",
    "progress",
    "detectedStep",
  ],
};

function sanitizeAuthUser(raw = {}) {
  return {
    userSn: raw.userSn || null,
    email: raw.email || null,
    username: raw.username || null,
    displayName: raw.displayName || null,
  };
}

function sanitizeActiveTaxFile(raw = {}) {
  return {
    id: raw.id || raw.taxFileId || null,
    taxFileId: raw.taxFileId || raw.id || null,
    taxYear: raw.taxYear || null,
    loyaltyReferralCode: raw.loyaltyReferralCode || null,
    caseStatus: raw.caseStatus || raw.status || null,
    progress: Number(raw.progress || 0),
    detectedStep: raw.detectedStep || null,
  };
}

module.exports = {
  HUB_IDENTITY_FIELDS,
  sanitizeAuthUser,
  sanitizeActiveTaxFile,
};
