function resolveActiveStack(context = {}) {
  const surface = context?.surface;
  const hasAuthUser = Boolean(context?.authUser?.userSn);
  const hasActiveTaxFile = Boolean(context?.activeTaxFile?.id);
  const caseClosed = context?.trigger === "case_closed";
  const detectedStep = context?.activeTaxFile?.detectedStep;

  // chat1 nunca hereda prestack ni stack externo
  if (surface === "chat1") {
    if (caseClosed) return "stack3";
    if (!hasActiveTaxFile) return "stack0";
    if (detectedStep === "step1") return "stack1";
    return "stack2";
  }

  // chat0 sí puede respetar stack heredado
  if (context?.stack) return context.stack;

  if (!hasAuthUser) return "prestack";
  if (caseClosed) return "stack3";
  if (!hasActiveTaxFile) return "stack0";
  if (detectedStep === "step1") return "stack1";
  return "stack2";
}

module.exports = {
  resolveActiveStack,
};

