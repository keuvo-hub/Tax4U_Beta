const ConversationState = require("../models/conversationState");
const { resolveCaseState } = require("../../utils/caseStateResolver");
const OpenAI = require("openai");
const { buildHubContext } = require("./hub/hubContextBuilder");
const { resolveActiveStack } = require("./hub/hubStackResolver");
const { getVisiblePrompt } = require("./hub/hubPromptContainer");
const { resolveHubUserContext } = require("./hub/hubUserContextResolver");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function detectLanguage(text = "") {
  const t = String(text).toLowerCase();

  if (/[áéíóúñü]/.test(t)) return "es";

  if (
    /\b(hola|buenas|gracias|impuestos|declaracion|declaración|quiero|necesito|ayuda|soy|tambien|también|cliente|preparador)\b/.test(t)
  ) {
    return "es";
  }

  return "en";
}

class ConversationalHubService {
  async processMessage(payload = {}) {
    try {
      const enriched = await resolveHubUserContext(payload);
      const context = buildHubContext(payload, enriched);

      /* PRIORITY QUEUE — CALL FIRST */
      if (context.trigger === "callchat1" || context.trigger === "callchat0") {
        context.forceRehydrate = true;
        context.isCall = true;
      }

      const stack = resolveActiveStack(context);

      /* RESOLVE SURFACE + CHANNEL WITH PRIORITY */
      if (context.trigger === "callchat1") {
        context.surface = "chat1";
        context.effectiveChannel = "clone1";
      } else if (context.trigger === "callchat0") {
        context.surface = "chat0";
        context.effectiveChannel = context?.authUser?.userSn ? "clone1" : "clone0";
      } else {
        context.surface = context.surface === "chat1" ? "chat1" : "chat0";
        context.effectiveChannel = context?.authUser?.userSn
          ? "clone1"
          : (context.channel || "clone0");
      }

      const isPublicSurface = context.surface === "chat0";
      const isPrivateSurface = context.surface === "chat1";

      let persistedConversationState = null;

if (context?.authUser?.userSn) {
  try {
    persistedConversationState = await ConversationState.findOne({
      userSn: context.authUser.userSn,
    });

    const detectedLanguage = detectLanguage(context.message || "");

    const resolvedLanguage =
      persistedConversationState?.language ||
      detectedLanguage ||
      "en";

    persistedConversationState = await ConversationState.findOneAndUpdate(
      { userSn: context.authUser.userSn },
      {
        userSn: context.authUser.userSn,
        stack,
        visibleClone: "clone1",
        lastMessage: context.message || "",
        lastSurface: context.surface || "",
        language: resolvedLanguage,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("conversationState error:", err.message);
  }
}

      const userSn = context?.authUser?.userSn || null;

      const caseState = resolveCaseState({
        case_context: context.activeTaxFile || {},
      });

      console.log("[HUB] caseState →", caseState);
      console.log("[DEBUG AUTH FULL]", context.authUser);
      console.log("[PRIORITY CALL]", {
        trigger: context.trigger,
        surface: context.surface,
        effectiveChannel: context.effectiveChannel,
        forceRehydrate: context.forceRehydrate || false,
        isPublicSurface,
        isPrivateSurface,
      });
      console.log("[hub] enriched-context", {
        channel: context.effectiveChannel,
        surface: context.surface,
        userSn,
        displayName: context?.authUser?.displayName || null,
        greetingMode: context?.derived?.greetingMode || null,
        detectedStep: context?.derived?.detectedStep || null,
        hasActiveCase: context?.derived?.hasActiveCase || false,
        hasConversationState: context?.derived?.hasConversationState || false,
        stack,
      });

      const basePrompt = getVisiblePrompt(stack, context.surface);

      const systemPrompt = `
${basePrompt}

SYSTEM PRIORITY INSTRUCTION:

Current case state = ${caseState}

You MUST:
- be concise
- be action-oriented
- guide immediately
`;

      const history = Array.isArray(payload.history) ? payload.history : [];

      const normalizedHistory = history
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          role:
            item.role === "assistant" || item.role === "system"
              ? item.role
              : "user",
          content:
            typeof item.content === "string"
              ? item.content
              : typeof item.message === "string"
              ? item.message
              : "",
        }))
        .filter((item) => item.content.trim().length > 0);

      const conversationInput = [
        ...normalizedHistory,
        {
          role: "user",
          content: context.message || "Hello",
        },
      ];

const persistedLanguage = persistedConversationState?.language || null;

const ctaDetectedLanguage = detectLanguage(context.message || "");

const finalLanguage =
  stack === "stack0"
    ? ctaDetectedLanguage
    : persistedLanguage || ctaDetectedLanguage || "en";

const languageInstruction =
  context.history?.some((m) =>
    typeof m.content === "string" &&
    m.content.toLowerCase().includes("español")
  )
    ? "The user prefers Spanish. You MUST respond ONLY in Spanish."
    : "Respond in English unless the user clearly switches language.";

      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        instructions: `${systemPrompt}\n\n${languageInstruction}`,
        input: conversationInput,
      });

      const reply = response.output_text || "No response generated";

      return {
        ok: true,
        stage: "openai-response",
        channel: context.effectiveChannel,
        stack,
        surface: context.surface,
        trigger: context.trigger,
        reply,
      };
    } catch (error) {
      return {
        ok: false,
        stage: "openai-error",
        error: error.message,
      };
    }
  }
}

module.exports = new ConversationalHubService();
