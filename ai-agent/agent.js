const fs = require("fs");
const OpenAI = require("openai");
const path = require("path");

// ================================
// AGENT INTERNAL FILES
// ================================

// ================================
// LOADERS
// ================================

function loadSystemPrompt() {
  if (!fs.existsSync(SYSTEM_PROMPT_FILE)) {
    console.warn("⚠️ Nie znaleziono pliku system-prompt.txt");
    return "";
  }
  return fs.readFileSync(SYSTEM_PROMPT_FILE, "utf-8");
}

function loadProjectContext() {
  if (!fs.existsSync(PROJECT_CONTEXT_FILE)) {
    console.warn("⚠️ Nie znaleziono pliku project-context.json");
    return "{}";
  }
  return fs.readFileSync(PROJECT_CONTEXT_FILE, "utf-8");
}


/* =========================
   ŚCIEŻKI I KONFIGURACJA
========================= */

// katalog główny projektu (virtual-office)
const PROJECT_ROOT = path.resolve(__dirname, "..");

// plik pamięci decyzji
const MEMORY_FILE = path.join(__dirname, "memory.json");

// plik system prompt i project context
// pliki konfiguracyjne agenta (zawsze względem katalogu ai-agent)
const AGENT_ROOT = __dirname;

const SYSTEM_PROMPT_FILE = path.join(AGENT_ROOT, "system-prompt.txt");
const PROJECT_CONTEXT_FILE = path.join(AGENT_ROOT, "project-context.json");
const DECISIONS_LOG_FILE = path.join(AGENT_ROOT, "decisions.log.md");


// plik z ostatnim planem
const LAST_PLAN_FILE = path.join(__dirname, ".last-plan.json");

/* =========================
   OPENAI
========================= */

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ BRAK OPENAI_API_KEY");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   ARGUMENTY STARTOWE
========================= */

// Format: node agent.js <mode> [query]
// mode: chat | plan | confirm | execute

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
  console.log("❌ Podaj tryb działania: chat | plan | confirm | execute oraz opcjonalnie zadanie");
  console.log(`np. node agent.js plan "opisz architekturę projektu"`);
  process.exit(1);
}

const mode = rawArgs[0].toLowerCase();
const query = rawArgs.slice(1).join(" ");

/* =========================
   PAMIĘĆ DECYZJI (NIE CZATU)
========================= */

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

/* =========================
   CZYTANIE REPO
========================= */

function readRepo(dir = PROJECT_ROOT, collected = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git"
    ) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      readRepo(fullPath, collected);
    } else if (
      entry.name.endsWith(".ts") ||
      entry.name.endsWith(".tsx") ||
      entry.name.endsWith(".js") ||
      entry.name.toLowerCase() === "readme.md"
    ) {
      collected.push({
        file: path.relative(PROJECT_ROOT, fullPath),
        content: fs.readFileSync(fullPath, "utf8"),
      });
    }
  }

  return collected;
}

/* =========================
   OPERACJE NA PLIKACH
========================= */

function writeFileSafe(filePath, content) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  console.log(`✏️ Zapisuję plik: ${filePath}`);
  fs.writeFileSync(fullPath, content, "utf8");
}

function createFileSafe(filePath, content) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (fs.existsSync(fullPath)) {
    console.log(`⚠️ Plik już istnieje: ${filePath} (pomijam create)`);
    return;
  }

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`🆕 Tworzę plik: ${filePath}`);
  fs.writeFileSync(fullPath, content, "utf8");
}

/* =========================
   LAST PLAN OPERACJE
========================= */

function loadLastPlan() {
  if (!fs.existsSync(LAST_PLAN_FILE)) {
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(LAST_PLAN_FILE, "utf8"));
    return data;
  } catch {
    return null;
  }
}

function saveLastPlan(plan) {
  fs.writeFileSync(LAST_PLAN_FILE, JSON.stringify(plan, null, 2));
  console.log(`💾 Zapisano ostatni plan do ${LAST_PLAN_FILE}`);
}

function removeLastPlan() {
  if (fs.existsSync(LAST_PLAN_FILE)) {
    fs.unlinkSync(LAST_PLAN_FILE);
    console.log(`🗑️ Usunięto plik z ostatnim planem`);
  }
}

/* =========================
   WCZYTYWANIE POMOCNICZYCH PLIKÓW
========================= */

function loadSystemPrompt() {
  if (!fs.existsSync(SYSTEM_PROMPT_FILE)) {
    console.warn(`⚠️ Nie znaleziono pliku system-prompt.txt`);
    return "You are a senior software engineer and technical lead.";
  }
  return fs.readFileSync(SYSTEM_PROMPT_FILE, "utf8");
}

function loadProjectContext() {
  if (!fs.existsSync(PROJECT_CONTEXT_FILE)) {
    console.warn(`⚠️ Nie znaleziono pliku project-context.json`);
    return {};
  }
  try {
    const content = fs.readFileSync(PROJECT_CONTEXT_FILE, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.warn(`⚠️ Błąd parsowania project-context.json`);
    return {};
  }
}

/* =========================
   GŁÓWNA LOGIKA AGENTA
========================= */

(async () => {
  // Wczytaj pliki pomocnicze
  const systemPrompt = loadSystemPrompt();
  const projectContext = loadProjectContext();

  console.log(`🤖 AI analizuje projekt w trybie: ${mode}\n`);

  const repo = readRepo();
  const memory = loadMemory();

  // We define states for plan confirmation workflow

  // lastPlan structure:
  // { plan: string, actions: array }

  if (mode === "chat") {
    if (!query) {
      console.log("❌ Brak zapytania do trybu chat.");
      process.exit(1);
    }

    // Chat mode: simple prompt to AI with project + system prompt + project context

    const messages = [
      {
        role: "system",
        content: systemPrompt +
          `\n
You have project context as JSON:
${JSON.stringify(projectContext, null, 2)}

Rules:
1. ALWAYS provide a concrete, actionable answer.
2. If code changes are required, respond ONLY with valid JSON in this format:

{
  "reply": "Very concrete answer (lists, exact variable names, steps)",
  "actions": [
    {
      "action": "write_file | create_file",
      "file": "relative/path/to/file",
      "content": "FULL FILE CONTENT"
    }
  ]
}

3. NEVER omit the "reply" field.
4. NEVER include explanations outside JSON when returning JSON.
5. NEVER store or repeat secrets (API keys, tokens).
6. Use "create_file" only if file does not exist.
7. Use "write_file" only if file exists.

CRITICAL SAFETY RULES:
- You are FORBIDDEN from deleting, modifying, or refactoring ANY function
  inside the file: ai-agent/agent.js
- You must NEVER propose changes to agent.js itself.
- Treat agent.js as READ-ONLY and IMMUTABLE.

DECISION:
Chat mode response.
`
      },
      {
        role: "user",
        content: query
      }
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages
    });

    const answer = response.choices[0].message.content;

    memory.push({ role: "user", content: query });
    memory.push({ role: "assistant", content: answer });
    saveMemory(memory);

    try {
      const parsed = JSON.parse(answer);

      console.log("\n🧠 AI (odpowiedź):\n");
      console.log(parsed.reply);

      if (Array.isArray(parsed.actions)) {
        for (const action of parsed.actions) {
          if (action.action === "write_file") {
            writeFileSafe(action.file, action.content);
          }
          if (action.action === "create_file") {
            createFileSafe(action.file, action.content);
          }
        }
      }
    } catch {
      console.log("\n🧠 AI:\n", answer);
    }

    return;
  }

 if (mode === "plan") {
  if (!query) {
    console.log("❌ Brak zadania do zaplanowania.");
    process.exit(1);
  }

  // PLAN MODE:
  // - diagnoza problemu
  // - zaproponowanie bezpiecznego, minimalnego planu
  // - BEZ implementacji
  // - BEZ modyfikacji agent.js

  const messages = [
    {
      role: "system",
      content: `
${systemPrompt}

PROJECT CONTEXT (read-only):
${JSON.stringify(projectContext, null, 2)}

MODE: PLAN

You are a senior software engineer and technical lead.

Your task:
- Generate a SAFE, STEP-BY-STEP PLAN for the user request.
- Focus FIRST on diagnosis if the problem is unclear.
- If the request contains multiple problems, SPLIT them into separate plans
  and clearly state what should be done FIRST.

STRICT RULES:
- Respond ONLY with valid JSON.
- JSON MUST contain exactly two top-level fields:
  - "reply" (human-readable explanation of the plan)
  - "actions" (array of planned actions for EXECUTE mode)
- Do NOT implement changes.
- Do NOT modify agent.js.
- Do NOT propose refactors unless explicitly requested.
- Minimize scope of changes.
- Assume this is a production codebase.

DECISION:
Plan generation only.
`
    },
    {
      role: "user",
      content: `
TASK:
${query}

PROJECT FILES:
${repo.map(f => `FILE: ${f.file}\n${f.content}`).join("\n\n")}
`
    }
  ];

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages,
  });

  const answer = response.choices[0].message.content;

  memory.push({ role: "user", content: query });
  memory.push({ role: "assistant", content: answer });
  saveMemory(memory);

  try {
    const parsed = JSON.parse(answer);

    if (!parsed.reply || !Array.isArray(parsed.actions)) {
      console.error("❌ Nieprawidłowa odpowiedź PLAN – wymagane pola: reply, actions");
      process.exit(1);
    }

    // Zapisz plan jako ostatni plan do wykonania
    saveLastPlan(parsed);

    console.log("\n🧠 PLAN wygenerowany. Aby wykonać, uruchom:");
    console.log("   node agent.js confirm\n");
    console.log(parsed.reply);

    return;
  } catch (e) {
    console.log("\n🧠 AI PLAN RESPONSE (RAW):\n", answer);
    console.error("❌ Nie można sparsować odpowiedzi PLAN jako JSON", e);
    process.exit(1);
  }
}


  if (mode === "confirm") {
    // Confirm last plan exists
    const lastPlan = loadLastPlan();
    if (!lastPlan) {
      console.log("❌ Brak zapisanego planu do potwierdzenia. Najpierw uruchom node agent.js plan <zadanie>");
      process.exit(1);
    }

    console.log("✅ Plan potwierdzony do wykonania.");
    console.log("Uruchom teraz: node agent.js execute, by wykonać plan.");

    // Save a file confirming plan execution allowed
    const confirmFile = path.join(__dirname, ".plan-confirmed");
    try {
      fs.writeFileSync(confirmFile, JSON.stringify({ confirmed: true, timestamp: new Date().toISOString() }));
      console.log(`💾 Zapisano plik potwierdzenia planu: ${confirmFile}`);
    } catch(e) {
      console.warn(`⚠️ Nie udało się zapisać pliku potwierdzenia: ${e}`);
    }

    return;
  }

  if (mode === "execute") {
    // Check confirmation exists
    const confirmFile = path.join(__dirname, ".plan-confirmed");

    if (!fs.existsSync(confirmFile)) {
      console.log("❌ Niezatwierdzony plan. Najpierw uruchom node agent.js confirm");
      process.exit(1);
    }

    // Load last plan
    const lastPlan = loadLastPlan();
    if (!lastPlan || !lastPlan.actions) {
      console.log("❌ Brak zapisanego planu do wykonania. Najpierw uruchom node agent.js plan <zadanie>");
      process.exit(1);
    }

    console.log("▶️ Wykonuję plan...\n");

    // Perform actions from last plan
    for (const action of lastPlan.actions) {
      try {
        if (action.action === "write_file") {
          writeFileSafe(action.file, action.content);
          console.log(` - Zapisano plik: ${action.file}`);
        } else if (action.action === "create_file") {
          createFileSafe(action.file, action.content);
          console.log(` - Utworzono plik: ${action.file}`);
        } else {
          console.log(`⚠️ Nieznana akcja: ${action.action}`);
        }
      } catch(e) {
        console.error(`❌ Błąd wykonania akcji na pliku ${action.file}:`, e);
      }
    }

    console.log("\n✅ Plan wykonany.");

    // Remove confirmation and last plan after execution
    try {
      fs.unlinkSync(confirmFile);
      fs.unlinkSync(LAST_PLAN_FILE);
      console.log("🗑️ Usunięto plik potwierdzenia i ostatniego planu.");
    } catch(e) {
      // ignore errors
    }

    return;
  }

  // If mode unknown
  console.log(`❌ Nieznany tryb: ${mode}. Dostępne tryby: chat | plan | confirm | execute`);
  process.exit(1);
})();