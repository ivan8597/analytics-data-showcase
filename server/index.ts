import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);

const QDRANT_URL = (process.env.QDRANT_URL || "http://localhost:6333").replace(/\/$/, "");
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || "analytics_assistant_memory";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const VECTOR_SIZE = Number(process.env.EMBEDDING_VECTOR_SIZE || 1536);
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

const knowledge = [
  { keywords: ["кто", "что", "сайт", "витрина", "услуги", "помогаете"], answer: "Это витрина инженерной аналитики. Здесь показан полный контур данных: источники → Greenplum DWH → Data Vault → витрины → BI. Мы помогаем проектировать DWH, пайплайны, качество, мониторинг и архитектурные POC.", link: "#top", label: "В начало" },
  { keywords: ["контур", "архитектура", "dwh", "data vault", "greenplum", "staging"], answer: "Контур строится как последовательный маршрут: PostgreSQL и ClickHouse попадают в staging Greenplum, затем проходят моделирование в Data Vault через dbt и превращаются в витрины для аналитиков и продуктов. На переходах фиксируются правила, проверки и ответственный контекст.", link: "#contour", label: "Открыть контур" },
  { keywords: ["процесс", "пайплайн", "airflow", "dbt", "soda", "качество", "инцидент"], answer: "Рабочий цикл включает 8 этапов: забрать источники, загрузить в Greenplum, построить слои DWH, оркестрировать DAG'и Airflow, моделировать в dbt, проверять Soda Core, разбирать инциденты и документировать контур.", link: "#operations", label: "Открыть процессы" },
  { keywords: ["реестр", "каталог", "lineage", "owner", "sla", "документация"], answer: "Реестр витрин хранит назначение витрины, источники и lineage, владельца, SLA обновления, правила качества, журнал изменений и runbook восстановления. Это делает знание о данных частью инфраструктуры.", link: "#registry", label: "Открыть реестр" },
  { keywords: ["excel", "таблица", "сверка", "сводный", "расчет"], answer: "Excel используется как практичный аналитический слой: для быстрых проверок, сверок выгрузок, промежуточных расчётов, сводных отчётов и коммуникации с бизнесом. Он дополняет инженерный контур, а не противопоставляется ему.", link: "#case", label: "К кейсу" },
  { keywords: ["кейс", "логистика", "транспорт", "результат", "эффект", "power bi"], answer: "В кейсе для логистической компании операционные, финансовые и HR-данные сведены в маршрут Sources → Staging → Data Vault → Data Marts → BI. Показатели: отчётность 15–20 минут вместо часов, около 70% меньше ручных операций и 30+ проверок качества.", link: "#case", label: "Открыть кейс" },
  { keywords: ["crypto", "крипто", "bitcoin", "btc", "eth", "coinbase", "pet", "open source"], answer: "Открытый pet-проект показывает end-to-end DWH pipeline для BTC-USD и ETH-USD: Coinbase API → MinIO/S3 → PostgreSQL/Greenplum → dbt → ClickHouse → BI. Пайплайн hourly, append-only raw layer, идемпотентная serving-модель и тесты качества.", link: "#case", label: "К open source" },
  { keywords: ["контакт", "заявка", "связаться", "почта", "email", "обсудить"], answer: "Чтобы обсудить задачу, заполните форму на сайте или напишите на ivan8597@yandex.ru. Можно начать с одной витрины, процесса обновления или архитектурной гипотезы.", link: "#request", label: "К форме заявки" },
  { keywords: ["poc", "proof", "гипотеза", "доказательство"], answer: "Архитектурный POC помогает сначала доказать путь: фиксируем гипотезу, критерии успеха, минимальный контур (Docker/Kubernetes, Greenplum, Airflow, мониторинг) и принимаем решение — внедрять, доработать или выбрать другой путь.", link: "#poc", label: "К блоку POC" },
];

type ChatMessage = { role: "user" | "assistant"; content: string };
type Memory = { id: string; text: string; kind: "conversation" | "fact"; createdAt: string };

function authHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...(QDRANT_API_KEY ? { "api-key": QDRANT_API_KEY } : {}) };
}

function localEmbedding(text: string): number[] {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
  for (const token of text.toLowerCase().normalize("NFKC").split(/[^a-zA-Z0-9А-Яа-яЁё]+/).filter(Boolean)) {
    const hash = crypto.createHash("sha256").update(token).digest();
    const index = hash.readUInt32BE(0) % VECTOR_SIZE;
    vector[index] += hash[4] % 2 ? 1 : -1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

async function embed(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) return localEmbedding(text);
  const response = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
    method: "POST",
    headers: { ...authHeaders(), Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!response.ok) {
    console.warn(`Embedding request failed: ${response.status}; using local fallback`);
    return localEmbedding(text);
  }
  const body = (await response.json()) as { data?: Array<{ embedding: number[] }> };
  return body.data?.[0]?.embedding || localEmbedding(text);
}

async function qdrantRequest<T>(route: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${QDRANT_URL}${route}`, { ...init, headers: { ...authHeaders(), ...(init?.headers || {}) } });
  if (!response.ok) throw new Error(`Qdrant request failed: ${response.status}`);
  return (await response.json()) as T;
}

async function ensureCollection(vectorSize: number) {
  try {
    await qdrantRequest(`/collections/${QDRANT_COLLECTION}`);
  } catch {
    await qdrantRequest(`/collections/${QDRANT_COLLECTION}`, {
      method: "PUT",
      body: JSON.stringify({ vectors: { size: vectorSize, distance: "Cosine" } }),
    });
  }
}

async function searchMemory(sessionId: string, question: string, vector: number[]): Promise<Memory[]> {
  await ensureCollection(vector.length);
  const result = await qdrantRequest<{ result?: Array<{ payload?: Memory }> }>(`/collections/${QDRANT_COLLECTION}/points/search`, {
    method: "POST",
    body: JSON.stringify({ vector, limit: 5, with_payload: true, filter: { must: [{ key: "sessionId", match: { value: sessionId } }] } }),
  });
  return (result.result || []).map((point) => point.payload).filter((payload): payload is Memory => Boolean(payload?.text));
}

async function saveMemory(sessionId: string, memory: Memory, vector: number[]) {
  await ensureCollection(vector.length);
  await qdrantRequest(`/collections/${QDRANT_COLLECTION}/points`, {
    method: "PUT",
    body: JSON.stringify({ points: [{ id: memory.id, vector, payload: { ...memory, sessionId } }] }),
  });
}

function findAnswer(question: string, memories: Memory[]) {
  const normalized = question.toLowerCase().replace(/ё/g, "е");
  const scored = knowledge.map((item) => ({ item, score: item.keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
  if (scored[0]?.score) return scored[0].item;
  const previous = memories.find((memory) => memory.kind === "conversation" && memory.text.startsWith("Пользователь: "));
  if (/(предыдущ|них|это|тот|сравни)/.test(normalized) && previous) {
    return { answer: `Контекст предыдущего вопроса восстановлен из памяти: «${previous.text.replace("Пользователь: ", "")}». Уточните, какой именно показатель или период нужно сопоставить.`, link: "#case", label: "Открыть кейс" };
  }
  return { answer: "Я знаю содержание этой витрины: контур DWH, процессы Airflow/dbt/Soda Core, реестр витрин, Excel-практику, логистический кейс, open-source crypto pipeline, POC и контакты. Уточните тему — отвечу точнее.", link: "#top", label: "Посмотреть все разделы" };
}

app.use(express.json({ limit: "32kb" }));

app.post("/api/assistant/chat", async (req, res) => {
  const { sessionId, question, messages = [] } = req.body as { sessionId?: string; question?: string; messages?: ChatMessage[] };
  if (!sessionId || !question?.trim()) return res.status(400).json({ error: "sessionId и question обязательны" });
  const safeQuestion = question.trim().slice(0, 4000);
  const recentMessages = messages.filter((message) => message?.role && typeof message.content === "string").slice(-10);
  try {
    const queryVector = await embed(safeQuestion);
    let memories: Memory[] = [];
    try { memories = await searchMemory(sessionId, safeQuestion, queryVector); } catch (error) { console.warn("Qdrant unavailable; continuing without semantic retrieval", error); }
    const answer = findAnswer(safeQuestion, memories);
    const transcript = [...recentMessages.map((message) => `${message.role === "user" ? "Пользователь" : "Бот"}: ${message.content}`), `Пользователь: ${safeQuestion}`, `Бот: ${answer.answer}`].join("\n");
    const memory: Memory = { id: crypto.randomUUID(), text: transcript.slice(-8000), kind: /запомни|предпочитаю|используем|важно/.test(safeQuestion.toLowerCase()) ? "fact" : "conversation", createdAt: new Date().toISOString() };
    try { await saveMemory(sessionId, memory, await embed(memory.text)); } catch (error) { console.warn("Memory was not persisted", error); }
    return res.json({ ...answer, memoryUsed: memories.length > 0, memoryCount: memories.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Не удалось сформировать ответ" });
  }
});

const staticPath = process.env.NODE_ENV === "production" ? path.resolve(__dirname, "public") : path.resolve(__dirname, "..", "dist", "public");
app.use(express.static(staticPath));
app.get("*", (_req, res) => res.sendFile(path.join(staticPath, "index.html")));

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
