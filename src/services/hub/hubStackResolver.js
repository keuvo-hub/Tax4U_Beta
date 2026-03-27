function resolveActiveStack(context = {}) {
  if (context?.stack) return context.stack;

  const hasAuthUser = Boolean(context?.authUser?.userSn);
  const hasActiveTaxFile = Boolean(context?.activeTaxFile?.id);
  const caseClosed = context?.trigger === "case_closed";
  const detectedStep = context?.activeTaxFile?.detectedStep;

  if (!hasAuthUser) return "prestack";
  if (caseClosed) return "stack3";
  if (hasActiveTaxFile && detectedStep !== "step1") return "stack2";
  if (hasActiveTaxFile && detectedStep === "step1") return "stack1";
  return "stack1";
}

module.exports = {
  resolveActiveStack,
};
