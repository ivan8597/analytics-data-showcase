import { useMemo, useState, type FormEvent } from "react";
import { Bot, ChevronDown, ExternalLink, LoaderCircle, RefreshCw, Send, Sparkles, Trash2, X } from "lucide-react";
import "./assistant.css";

type Message = { role: "assistant" | "user"; text: string; link?: string; label?: string };
type KnowledgeItem = { keywords: string[]; answer: string; link?: string; label?: string };
type AssistantAnswer = Omit<KnowledgeItem, "keywords">;

const knowledge: KnowledgeItem[] = [
  {
    keywords: ["кто", "что", "сайт", "витрина", "услуги", "помогаете"],
    answer: "Это витрина инженерной аналитики. Здесь показан полный контур данных: источники → Greenplum DWH → Data Vault → витрины → BI. Мы помогаем проектировать DWH, пайплайны, качество, мониторинг и архитектурные POC.",
    link: "#top",
    label: "В начало",
  },
  {
    keywords: ["контур", "архитектура", "dwh", "data vault", "greenplum", "staging"],
    answer: "Контур строится как последовательный маршрут: PostgreSQL и ClickHouse попадают в staging Greenplum, затем проходят моделирование в Data Vault через dbt и превращаются в витрины для аналитиков и продуктов. На переходах фиксируются правила, проверки и ответственный контекст.",
    link: "#contour",
    label: "Открыть контур",
  },
  {
    keywords: ["процесс", "пайплайн", "airflow", "dbt", "soda", "качество", "инцидент"],
    answer: "Рабочий цикл включает 8 этапов: забрать источники, загрузить в Greenplum, построить слои DWH, оркестрировать DAG'и Airflow, моделировать в dbt, проверять Soda Core, разбирать инциденты и документировать контур.",
    link: "#operations",
    label: "Открыть процессы",
  },
  {
    keywords: ["реестр", "каталог", "lineage", "owner", "sla", "документация"],
    answer: "Реестр витрин хранит назначение витрины, источники и lineage, владельца, SLA обновления, правила качества, журнал изменений и runbook восстановления. Это делает знание о данных частью инфраструктуры.",
    link: "#registry",
    label: "Открыть реестр",
  },
  {
    keywords: ["excel", "таблица", "сверка", "сводный", "расчёт"],
    answer: "Excel используется как практичный аналитический слой: для быстрых проверок, сверок выгрузок, промежуточных расчётов, сводных отчётов и коммуникации с бизнесом. Он дополняет инженерный контур, а не противопоставляется ему.",
    link: "#case",
    label: "К кейсу",
  },
  {
    keywords: ["кейс", "логистика", "транспорт", "результат", "эффект", "power bi"],
    answer: "В кейсе для логистической компании операционные, финансовые и HR-данные сведены в маршрут Sources → Staging → Data Vault → Data Marts → BI. Показатели: отчётность 15–20 минут вместо часов, ~70% меньше ручных операций и 30+ проверок качества.",
    link: "#case",
    label: "Открыть кейс",
  },
  {
    keywords: ["crypto", "крипто", "bitcoin", "btc", "eth", "coinbase", "pet", "open source"],
    answer: "Открытый pet-проект показывает end-to-end DWH pipeline для BTC-USD и ETH-USD: Coinbase API → MinIO/S3 → PostgreSQL/Greenplum → dbt → ClickHouse → BI. Пайплайн hourly, append-only raw layer, идемпотентная serving-модель и тесты качества.",
    link: "#case",
    label: "К open source",
  },
  {
    keywords: ["контакт", "заявка", "связаться", "почта", "email", "обсудить"],
    answer: "Чтобы обсудить задачу, заполните форму на сайте или напишите на ivan8597@yandex.ru. Можно начать с одной витрины, процесса обновления или архитектурной гипотезы.",
    link: "#request",
    label: "К форме заявки",
  },
  {
    keywords: ["poc", "proof", "гипотеза", "доказательство"],
    answer: "Архитектурный POC помогает сначала доказать путь: фиксируем гипотезу, критерии успеха, минимальный контур (Docker/Kubernetes, Greenplum, Airflow, мониторинг) и принимаем решение — внедрять, доработать или выбрать другой путь.",
    link: "#poc",
    label: "К блоку POC",
  },
  {
    keywords: ["политика", "данные", "privacy", "конфиденциальность", "история"],
    answer: "AI-агент отвечает по встроенной базе знаний о приложении. История диалога хранится только в сеансе браузера и не отправляется на сервер витрины. Не вводите пароли и персональные данные.",
    link: "/privacy.html",
    label: "Политика данных",
  },
];

const suggestions = ["Что входит в контур данных?", "Расскажи про кейс", "Что такое архитектурный POC?", "Как связаться?"];

function findAnswer(question: string): AssistantAnswer {
  const normalized = question.toLowerCase().replace(/ё/g, "е");
  const scored = knowledge
    .map((item) => ({ item, score: item.keywords.reduce((total, keyword) => total + (normalized.includes(keyword) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score);

  if (scored[0]?.score) return scored[0].item;
  return {
    answer: "Я знаю содержание этой витрины: контур DWH, процессы Airflow/dbt/Soda Core, реестр витрин, Excel-практику, логистический кейс, open-source crypto pipeline, POC и контакты. Уточните тему — отвечу точнее.",
    link: "#top",
    label: "Посмотреть все разделы",
  };
}

export default function AnalyticsAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Привет! Я навигатор по витрине данных. Расскажу про архитектуру, процессы, кейсы и помогу перейти к нужному разделу." },
  ]);

  const latestSuggestion = useMemo(() => suggestions.filter((suggestion) => !messages.some((message) => message.text === suggestion))[0], [messages]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    setError("");
    setLastQuestion(trimmed);
    setIsLoading(true);
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      const result = findAnswer(trimmed);
      setMessages((current) => [...current, { role: "assistant", text: result.answer, link: result.link, label: result.label }]);
    } catch {
      setError("Не удалось сформировать ответ. Попробуйте ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([{ role: "assistant", text: "История очищена. Задайте новый вопрос по разделам витрины." }]);
    setError("");
    setLastQuestion("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(input);
  };

  return (
    <div className={`assistant ${open ? "assistant-open" : ""}`}>
      {open && (
        <section className="assistant-panel" aria-label="AI-агент по приложению">
          <div className="assistant-head">
            <div className="assistant-title"><span className="assistant-orb"><Bot size={18} /></span><div><strong>AI-агент витрины</strong><small>знает разделы и контур данных</small></div></div>
            <div className="assistant-tools"><button className="assistant-tool" type="button" onClick={clearHistory} disabled={isLoading} aria-label="Очистить историю"><Trash2 size={15} /></button><button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label="Закрыть чат"><X size={18} /></button></div>
          </div>
          <div className="assistant-messages" aria-live="polite" aria-busy={isLoading}>
            {messages.map((message, index) => <div className={`assistant-message assistant-${message.role}`} key={`${message.role}-${index}`}><span>{message.text}</span>{message.link && message.label && <a className="assistant-link" href={message.link}>{message.label} <ExternalLink size={12} /></a></div>)}
            {isLoading && <div className="assistant-loading"><LoaderCircle size={15} /> Формирую ответ по приложению…</div>}
            {error && <div className="assistant-error" role="alert"><span>{error}</span><button type="button" onClick={() => void ask(lastQuestion)} disabled={isLoading}><RefreshCw size={13} /> Повторить</button></div>}
          </div>
          <div className="assistant-suggestions">
            {suggestions.slice(0, 3).map((suggestion) => <button type="button" key={suggestion} onClick={() => void ask(suggestion)} disabled={isLoading}>{suggestion}</button>)}
          </div>
          <form className="assistant-form" onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Задайте вопрос…" aria-label="Вопрос AI-агенту" disabled={isLoading} />
            <button type="submit" aria-label="Отправить вопрос" disabled={isLoading}><Send size={16} /></button>
          </form>
          {latestSuggestion && <span className="assistant-hint"><Sparkles size={13} /> Ответы основаны на содержании приложения · <a href="/privacy.html" target="_blank" rel="noreferrer">Политика данных</a></span>}
        </section>
      )}
      <button className="assistant-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Открыть AI-агента">
        <span className="assistant-trigger-icon">{open ? <ChevronDown size={19} /> : <Bot size={19} />}</span><span>{open ? "Свернуть агента" : "Спросить AI-агента"}</span>
      </button>
    </div>
  );
}
