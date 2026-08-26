import { useMemo, useState, type FormEvent } from "react";
import { Bot, ChevronDown, ExternalLink, Send, Sparkles, X } from "lucide-react";

type Message = { role: "assistant" | "user"; text: string; link?: string; label?: string };
type KnowledgeItem = { keywords: string[]; answer: string; link?: string; label?: string };

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
    answer: "В кейсе для логистической компании операционные, финансовые и HR-данные сведены в маршрут Sources → Staging → Data Vault → Data Marts → BI. Показатели проекта: отчётность за 15–20 минут вместо нескольких часов, примерно на 70% меньше ручных операций и более 30 автоматизированных проверок качества.",
    link: "#case",
    label: "Открыть кейс",
  },
  {
    keywords: ["crypto", "крипто", "bitcoin", "btc", "eth", "coinbase", "pet", "open source"],
    answer: "Открытый pet-проект показывает end-to-end DWH pipeline для BTC-USD и ETH-USD: Coinbase API → MinIO/S3 → PostgreSQL/Greenplum → dbt → ClickHouse → BI. Пайплайн запускается ежечасно, использует append-only raw layer, идемпотентную serving-модель и тесты качества.",
    link: "#case",
    label: "К открытому проекту",
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
];

const suggestions = [
  "Что это за сайт?",
  "Как устроен контур данных?",
  "Какие процессы вы закрываете?",
  "Расскажите про кейс",
  "Есть open source проект?",
  "Как связаться?",
];

function findAnswer(question: string): KnowledgeItem {
  const normalized = question.toLowerCase();
  const scored = knowledge
    .map((item) => ({
      item,
      score: item.keywords.reduce((sum, keyword) => sum + (normalized.includes(keyword) ? 1 : 0), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored[0]) return scored[0].item;

  return {
    keywords: [],
    answer: "Я могу рассказать про контур данных, процессы, реестр витрин, Excel-практику, кейс по логистике, open-source crypto pipeline, POC и контакты. Задайте вопрос по одному из этих разделов.",
    link: "#contour",
    label: "К контуру",
  };
}

export default function AnalyticsAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Здравствуйте! Я AI-агент витрины. Спросите про контур данных, процессы, кейс, реестр или контакты — отвечу по содержанию сайта.",
    },
  ]);

  const latestSuggestion = useMemo(() => suggestions.filter((suggestion) => !messages.some((message) => message.text === suggestion))[0], [messages]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const result = findAnswer(trimmed);
    setMessages((current) => [...current, { role: "user", text: trimmed }, { role: "assistant", text: result.answer, link: result.link, label: result.label }]);
    setInput("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <div className={`assistant ${open ? "assistant-open" : ""}`}>
      {open && (
        <section className="assistant-panel" aria-label="AI-агент по приложению">
          <div className="assistant-head">
            <div className="assistant-title"><span className="assistant-orb"><Bot size={18} /></span><div><strong>AI-агент витрины</strong><small>знает разделы и контур данных</small></div></div>
            <button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label="Закрыть чат"><X size={18} /></button>
          </div>
          <div className="assistant-messages" aria-live="polite">
            {messages.map((message, index) => <div className={`assistant-message assistant-${message.role}`} key={`${message.role}-${index}`}><span>{message.text}</span>{message.link && message.label && <a className="assistant-link" href={message.link}>{message.label} <ExternalLink size={12} /></a></div>)}
          </div>
          <div className="assistant-suggestions">
            {suggestions.slice(0, 3).map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}
          </div>
          <form className="assistant-form" onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Задайте вопрос…" aria-label="Вопрос AI-агенту" />
            <button type="submit" aria-label="Отправить вопрос"><Send size={16} /></button>
          </form>
          {latestSuggestion && <span className="assistant-hint"><Sparkles size={13} /> Ответы основаны на содержании приложения</span>}
        </section>
      )}
      <button className="assistant-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Открыть AI-агента">
        <span className="assistant-trigger-icon">{open ? <ChevronDown size={19} /> : <Bot size={19} />}</span><span>{open ? "Свернуть агента" : "Спросить AI-агента"}</span>
      </button>
    </div>
  );
}
