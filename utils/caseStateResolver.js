function resolveCaseState(taxFile = {}) {
  const ctx = taxFile.case_context || {};

  const status = ctx.status || null;

  switch (status) {
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
      return null;
  }
}

module.exports = { resolveCaseState };
