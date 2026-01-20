const fs = require("fs");
const OpenAI = require("openai");
const path = require("path");

/* =========================
   ŚCIEŻKI I KONFIGURACJA
========================= */

// katalog główny projektu (virtual-office)
const PROJECT_ROOT = path.resolve(__dirname, "..");

// plik pamięci decyzji
const MEMORY_FILE = path.join(__dirname, "memory.json");

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
   ARGUMENT STARTOWY
========================= */

const question = process.argv.slice(2).join(" ");

if (!question) {
  console.log("❌ Podaj zadanie, np:");
  console.log(`node agent.js "opisz architekturę projektu"`);
  process.exit(1);
}

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
   GŁÓWNA LOGIKA AGENTA
========================= */

(async () => {
  console.log("🤖 AI analizuje projekt...\n");

  const repo = readRepo();
  const memory = loadMemory();

  const messages = [
    {
      role: "system",
      content: `
You are a senior software engineer and technical lead.

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

If you make a stable architectural or security decision, include:

CRITICAL SAFETY RULES:
- You are FORBIDDEN from deleting, modifying, or refactoring ANY function
  inside the file: ai-agent/agent.js
- You must NEVER propose changes to agent.js itself.
- Treat agent.js as READ-ONLY and IMMUTABLE.

DECISION:
<short clear sentence>
`
    },
    {
      role: "user",
      content: `
TASK:
${question}

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
  // === ZAPIS ROZMOWY DO PAMIĘCI (TYLKO CZAT) ===
  memory.push({ role: "user", content: question });
  memory.push({ role: "assistant", content: answer });
  saveMemory(memory);



  // obsługa odpowiedzi
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
})();
