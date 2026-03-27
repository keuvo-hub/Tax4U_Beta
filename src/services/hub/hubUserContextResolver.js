const ConversationState = require("../../models/conversationState");
const User = require("../../../models/user");
const TaxFile = require("../../../models/taxfile");

function pickDisplayName(userDoc) {
  if (!userDoc) return null;

  return (
    userDoc.firstName ||
    userDoc.display_name ||
    userDoc.username ||
    userDoc.email ||
    null
  );
}

function mapCaseStep(activeTaxFile) {
  if (!activeTaxFile) return null;

  const status = String(
    activeTaxFile.case_context?.status ||
    activeTaxFile.caseStatus ||
    activeTaxFile.status ||
    ""
  ).toLowerCase();

  const progress = Number(
    activeTaxFile.progress ??
    activeTaxFile.progress_number ??
    0
  );

  // 🔴 PRIORIDAD: case_context real
  if (status.includes("completed") || status.includes("closed")) return "closed";

  if (
    status.includes("ready_for_review") ||
    status.includes("review")
  ) return "step3";

  if (
    status.includes("analyzing") ||
    status.includes("documents") ||
    status.includes("step3_triggered")
  ) return "step2";

  // 🟡 fallback (legacy progress)
  if (progress >= 75) return "step3";
  if (progress >= 25) return "step2";

  return "step1";
}

async function resolveHubUserContext(payload = {}) {
  const authUserSn = payload?.authUser?.userSn || null;

  let userDoc = null;
  let conversationState = null;
  let activeTaxFile = null;

  if (authUserSn) {
  try {
    userDoc = await User.findOne({ ID: String(authUserSn) })
      .select("ID firstName lastName email username display_name")
      .lean();
  } catch (err) {
    console.error("resolveHubUserContext userDoc error:", err.message);
  }

  try {
    const numericUserSn = Number(authUserSn);

    if (Number.isFinite(numericUserSn)) {
      conversationState = await ConversationState.findOne({ userSn: numericUserSn }).lean();
    } else {
      conversationState = null;
    }
  } catch (err) {
    console.error("resolveHubUserContext conversationState error:", err.message);
  }

  try {
    activeTaxFile = await TaxFile.findOne({
      $and: [
        {
          $or: [
            { user: authUserSn },
            { user: String(authUserSn) }
          ]
        },
        {
          $or: [
            { taxfile_status: { $ne: "completed" } },
            { caseStatus: { $ne: "closed" } }
          ]
        }
      ]
    })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();
  } catch (err) {
    console.error("resolveHubUserContext activeTaxFile error:", err.message);
  }
}

  const hasHistory =
    Array.isArray(payload.history) && payload.history.length > 0;

  const hasConversationState = !!conversationState;
  const hasActiveCase = !!activeTaxFile;
  const displayName = pickDisplayName(userDoc);
  const detectedStep = mapCaseStep(activeTaxFile);

  const isFirstTimeUser =
    !!authUserSn &&
    !hasConversationState &&
    !hasActiveCase &&
    !hasHistory;

  const isReturningUser =
    !!authUserSn &&
    (hasConversationState || hasHistory) &&
    !hasActiveCase;

  const isInProgressCase =
    !!authUserSn &&
    hasActiveCase &&
    detectedStep !== "closed";

  let greetingMode = "neutral";

  if (isFirstTimeUser) greetingMode = "first_time";
  else if (isInProgressCase && (hasConversationState || hasHistory)) greetingMode = "resume_case";
  else if (isReturningUser) greetingMode = "welcome_back";
  else if (displayName) greetingMode = "known_user";

  return {
    authUser: {
      userSn: authUserSn,
      email: userDoc?.email || payload?.authUser?.email || null,
      username: userDoc?.username || null,
      displayName
    },
    conversationState: conversationState
      ? {
          hasState: true,
          stack: conversationState.stack || null,
          lastMessage: conversationState.lastMessage || null,
          lastSurface: conversationState.lastSurface || null,
          updatedAt: conversationState.updatedAt || null
        }
      : {
          hasState: false
        },
    activeTaxFile: activeTaxFile
      ? {
          id: String(activeTaxFile._id),
          caseStatus: activeTaxFile.caseStatus || activeTaxFile.status || null,
          progress: Number(
  activeTaxFile.progress ??
  activeTaxFile.progress_number ??
  0
),
          detectedStep
        }
      : null,
    derived: {
      isFirstTimeUser,
      isReturningUser,
      isInProgressCase,
      hasConversationState,
      hasActiveCase,
      detectedStep,
      greetingMode
    }
  };
}

module.exports = {
  resolveHubUserContext,
};
