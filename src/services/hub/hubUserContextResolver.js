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
  if (progress >= 30) return "step2";

  return "step1";
}

async function resolveHubUserContext(payload = {}) {
  const authUserSn = payload?.authUser?.userSn || null;

  let userDoc = null;
  let conversationState = null;
  let activeTaxFile = null;

const mongoose = require("mongoose");
const { Types } = mongoose;

function isValidObjectId(value) {
  return !!value && Types.ObjectId.isValid(String(value));
}

function isNumericUserSn(value) {
  return typeof value === "number" || /^[0-9]+$/.test(String(value || ""));
}

const authUser = payload?.authUser || null;

const rawUserId =
  authUser?._id ||
  authUser?.id ||
  authUser?.userId ||
  userDoc?._id ||
  null;

const normalizedUserObjectId = isValidObjectId(rawUserId)
  ? new Types.ObjectId(String(rawUserId))
  : null;

const rawUserSn =
  authUser?.userSn ??
  authUserSn ??
  userDoc?.ID ??
  null;

const normalizedUserSn = isNumericUserSn(rawUserSn)
  ? Number(rawUserSn)
  : null;

  if (authUserSn) {
  try {
    userDoc = await User.findOne({ ID: String(authUserSn) })
      .select("_id ID firstName lastName email username display_name")
      .lean();

console.log("USER DOC:", userDoc);
  } catch (err) {
    console.error("resolveHubUserContext userDoc error:", err.message);
  }

  try {
    const mongoose = require("mongoose");
const { Types } = mongoose;

function isValidObjectId(value) {
  return !!value && Types.ObjectId.isValid(String(value));
}


  if (normalizedUserSn !== null) {
    conversationState = await ConversationState.findOne({ userSn: normalizedUserSn }).lean();
  } else {
    conversationState = null;
  }
} catch (err) {
  console.error("resolveHubUserContext conversationState error:", err.message);
}

try {
  if (userDoc?._id) {
    const taxFiles = await TaxFile.find({ user: userDoc._id })
      .populate("province_name", "-__v")
      .sort("-updatedAt")
      .lean();

    activeTaxFile =
      Array.isArray(taxFiles) && taxFiles.length > 0
        ? taxFiles[0]
        : null;
  } else {
    activeTaxFile = null;
  }
} catch (err) {
  console.error("resolveHubUserContext activeTaxFile error:", err.message);
}
  if (!activeTaxFile) {
    console.log("⚠️ No activeTaxFile found for user _id:", userDoc?._id);
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
  ? (() => {
      const caseContext = activeTaxFile.case_context || {};
      const documentContext = caseContext.document_context || {};

      return {
        id: activeTaxFile?._id?.toString?.() || activeTaxFile?.id || null,
        taxYear: activeTaxFile?.year || activeTaxFile?.taxYear || null,
        firstName: activeTaxFile?.first_name || null,
        lastName: activeTaxFile?.last_name || null,
        progress: Number(
          activeTaxFile?.progress_number ??
          activeTaxFile?.progress ??
          0
        ),
        detectedStep,
        caseStatus:
          caseContext?.status ||
          activeTaxFile?.caseStatus ||
          activeTaxFile?.status ||
          null,
        nextBestAction: caseContext?.next_best_action || null,
        readyForAgent: caseContext?.ready_for_agent ?? false,
        paymentStatus:
          activeTaxFile?.payment_status ||
          activeTaxFile?.stripe_payment ||
          null,
        appointment:
          activeTaxFile?.appointment ||
          caseContext?.appointment ||
          null,
        workflowPercent:
          activeTaxFile?.workflow_percent ??
          caseContext?.workflow_percent ??
          null,
        userSummary: caseContext?.user_summary || null,
        adminSummary: caseContext?.admin_summary || null,
        checklistSummary: Array.isArray(documentContext?.checklist)
          ? documentContext.checklist
          : [],
        documentsDetected: Array.isArray(documentContext?.documents_detected)
          ? documentContext.documents_detected
          : []
      };
    })()
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
}
module.exports = {
  resolveHubUserContext,
};
