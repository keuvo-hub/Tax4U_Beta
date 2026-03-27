const fs = require("fs");
const path = require("path");

const PROMPT_FILES = {
  prestack: path.join(process.cwd(),"containerprompts","clone0","masterprompt0.md"),
  stack0: path.join(
    process.cwd(),
    "containerprompts",
    "clone1",
    "masterprompt1.md"
  ),
  stack1: path.join(
    process.cwd(),
    "containerprompts",
    "clone1",
    "masterprompt1.md"
  ),
};

const FALLBACK_VISIBLE_PROMPTS = {
  stack1: `
You are Tax4U Clone1.

Help the authenticated user continue clearly and efficiently.

- Be concise
- Focus on next steps
- Avoid unnecessary explanations
- Guide toward completion of their process
`,

  stack2: `
You are Tax4U Clone1.

The user has an active tax case.

- Be operational and direct
- Help move the case forward
- Focus on documents, steps, and progress
`,

  stack3: `
You are Tax4U Clone1.

The user has completed a case.

- Focus on continuity, loyalty, and future preparation
- Suggest next logical actions (next tax year, referrals, etc.)
`,
};

const INTERNAL_PROMPTS = {
  stack0: {},
  stack1: {},
  stack2: {},
  stack3: {},
};

function readPromptFile(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return "";
    }

    return fs.readFileSync(filePath, "utf8").trim();
  } catch (error) {
    return "";
  }
}

function loadMarkdownFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      return "";
    }

    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".md"))
      .sort();

    return files
      .map((file) => {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, "utf8").trim();
        return `\n\n# FILE: ${file}\n\n${content}`;
      })
      .join("");
  } catch (error) {
    return "";
  }
}

function getStack0PublicContext() {
  const publicLandingPath = path.join(
    process.cwd(),
    "containerprompts",
    "clone0",
    "publiclanding"
  );

  const sharedLegalPath = path.join(
    process.cwd(),
    "containerprompts",
    "shared",
    "legal"
  );

  const publicLanding = loadMarkdownFolder(publicLandingPath);
  const sharedLegal = loadMarkdownFolder(sharedLegalPath);

  return `${publicLanding}\n\n${sharedLegal}`.trim();
}

function getVisiblePrompt(stack = "stack0", surface = "chat0") {
  const filePrompt = readPromptFile(PROMPT_FILES[stack]);

  let basePrompt = "";

  if (filePrompt) {
    basePrompt = filePrompt;
  } else if (FALLBACK_VISIBLE_PROMPTS[stack]) {
    basePrompt = FALLBACK_VISIBLE_PROMPTS[stack];
  } else {
    basePrompt = readPromptFile(PROMPT_FILES.stack0) || "";
  }

  if (stack === "prestack" || stack === "stack0") {
  const publicContext = getStack0PublicContext();

  return `
${basePrompt}

## Public Website Context

${publicContext}
`.trim();
}

  if (stack === "stack1" || stack === "stack2" || stack === "stack3") {
    const clone1Context =
      surface === "chat1"
        ? getClone1PrivateContext()
        : getClone1PublicContext();

    return `
${basePrompt}

## Clone1 Context

${clone1Context}
`.trim();
  }

  return basePrompt;
}

function getInternalPrompt(stack = "stack0", clone = "clone2") {
  return INTERNAL_PROMPTS?.[stack]?.[clone] || "";
}

module.exports = {
  getVisiblePrompt,
  getInternalPrompt,
};

function getClone1PublicContext() {
  const publicLandingPath = path.join(
    process.cwd(),
    "containerprompts",
    "clone1",
    "publiclanding"
  );

  const sharedLegalPath = path.join(
    process.cwd(),
    "containerprompts",
    "shared",
    "legal"
  );

  const publicLanding = loadMarkdownFolder(publicLandingPath);
  const sharedLegal = loadMarkdownFolder(sharedLegalPath);

  return `${publicLanding}\n\n${sharedLegal}`.trim();
}

function getClone1PrivateContext() {
  const userPortalPath = path.join(
    process.cwd(),
    "containerprompts",
    "clone1",
    "userportal"
  );

  const sharedLegalPath = path.join(
    process.cwd(),
    "containerprompts",
    "shared",
    "legal"
  );

  const userPortal = loadMarkdownFolder(userPortalPath);
  const sharedLegal = loadMarkdownFolder(sharedLegalPath);

  return `${userPortal}\n\n${sharedLegal}`.trim();
}


