function resolveCaseState(taxFile = {}) {
  const ctx = taxFile.case_context || {};
  const s3 = taxFile.step3_ai || {};

  const status = ctx.status || s3.status || "inactive";

  switch (status) {
    case "step3_triggered":
      return "collecting_documents";

    case "waiting_documents":
    case "missing_documents":
      return "missing_required_documents";

    case "reviewing_uploads":
      return "analyzing_documents";

    case "documents_complete":
      return "ready_for_review";

    case "ready_for_agent":
      return "ready_for_agent";

    case "closed":
      return "closed";

    default:
      return "collecting_documents";
  }
}

module.exports = { resolveCaseState };
