/* Editorial Systems: an asymmetric analytical report where signals, routes, and typography make the engineering story legible. */
import { useState, type FormEvent } from "react";
import AnalyticsAssistant from "../components/AnalyticsAssistant";
import {
  ArrowDownRight,
  ArrowRight,
  Box,
  Braces,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CloudCog,
  Database,
  FileCode2,
  GitBranch,
  Layers3,
  LineChart,
  Network,
  RefreshCw,
  ShieldCheck,
  TableProperties,
  TerminalSquare,
} from "lucide-react";

const assets = {
  logo: "/manus-storage/vitrina-data-logo_34ba9291.png",
  hero: "/manus-storage/analytics-hero-network_fc1f8e05.png",
  validation: "/manus-storage/analytics-validation_1b2b31e0.png",
  registry: "/manus-storage/analytics-registry_4582ae0.png",
  excel: "/manus-storage/analytics-excel-craft_f143b309.png",
};

const capabilities = [
  {
    icon: Database,
    title: "Собираем",
    copy: "Забираем PostgreSQL, ClickHouse, файлы и внешние сервисы. Загружаем их в Greenplum без ручных обходных путей.",
    index: "01",
  },
  {
    icon: ShieldCheck,
    title: "Проверяем",
    copy: "Убираем дубли, приводим форматы и задаём правила Soda Core, чтобы аналитики работали с проверенным слоем.",
    index: "02",
  },
  {
    icon: CloudCog,
    title: "Запускаем",
    copy: "Собираем приложения в Docker, размещаем в Kubernetes и оркестрируем загрузки в Airflow с ретраями и зависимостями.",
    index: "03",
  },
  {
    icon: Braces,
    title: "Доказываем",
    copy: "Предлагаем и защищаем архитектурные решения через короткие POC — от гипотезы до понятного технического результата.",
    index: "04",
  },
];

const operations = [
  ["01", "Забираем источники", "PostgreSQL, ClickHouse, файлы и внешние сервисы становятся управляемым входящим потоком.", GitBranch],
  ["02", "Загружаем в Greenplum", "ETL/ELT-пайплайны доставляют данные в корпоративное хранилище и фиксируют правила обновления.", Database],
  ["03", "Строим слои DWH", "Раскладываем модель по слоям staging → Data Vault → витрины данных.", Layers3],
  ["04", "Оркестрируем Airflow", "Python DAG'и управляют зависимостями, обработкой ошибок и повторными попытками загрузок.", RefreshCw],
  ["05", "Моделируем в dbt", "Пишем и оптимизируем SQL-модели, превращая расчёты в версионируемый слой DWH.", FileCode2],
  ["06", "Контролируем Soda Core", "Проверки качества ловят аномалии, дубли и нарушения контрактов данных до публикации витрин.", ClipboardCheck],
  ["07", "Разбираем инциденты", "Находим первопричину расхождений, восстанавливаем данные и создаём защиту от повторения.", LineChart],
  ["08", "Документируем контур", "Ведём описания моделей, источников, регламентов загрузки и владельцев процессов.", Network],
] as const;

export default function Home() {
  const [pocOpen, setPocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestStatus, setRequestStatus] = useState("");
  const [request, setRequest] = useState({ name: "", company: "", email: "", topic: "Архитектурный POC", message: "" });

  const copyBrief = async () => {
    const text = "Контур данных: источники, качество, витрины, Docker/Kubernetes, мониторинг, документация и архитектурный POC.";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const sendRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = `Заявка с сайта: ${request.topic}`;
    const body = [
      `Имя: ${request.name}`,
      `Компания / роль: ${request.company || "не указано"}`,
      `Контакт: ${request.email}`,
      `Тема: ${request.topic}`,
      "",
      "Задача:",
      request.message,
    ].join("\n");
    setRequestStatus("Открываем письмо с заполненным брифом…");
    window.location.href = `mailto:ivan8597@yandex.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div>
      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="#top" aria-label="Витрина данных — в начало">
            <img className="brand-mark" src={assets.logo} alt="" />
            <span>
              <span className="brand-name">Витрина данных</span>
              <span className="brand-sub">engineering & analytics</span>
            </span>
          </a>
          <nav className="nav-links" aria-label="Основная навигация">
            <a href="#contour">Контур</a>
            <a href="#operations">Процессы</a>
            <a href="#registry">Реестр</a>
            <a href="#case">Кейс</a>
          </nav>
          <a className="nav-cta" href="#contact">Обсудить задачу <ArrowDownRight size={14} /></a>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-grid" />
          <img className="hero-image" src={assets.hero} alt="Абстрактная схема потока данных" />
          <div className="hero-fade" />
          <div className="hero-content">
            <div className="hero-kicker">Единое пространство аналитики</div>
            <h1 id="hero-title">Данные, которым <em>можно доверять.</em></h1>
            <p className="hero-lede">
              Строим инженерный контур от источника до решения: собираем, проверяем, обновляем, документируем и превращаем данные в устойчивые аналитические витрины.
            </p>
            <div className="hero-actions">
              <a className="primary-btn" href="#contour">Посмотреть контур <ArrowRight size={17} /></a>
              <a className="secondary-btn" href="#poc">Архитектурный POC <Box size={16} /></a>
            </div>
            <div className="hero-foot" aria-label="Ключевые принципы">
              <div className="hero-stat"><strong>единый контур</strong><span>от источника до витрины</span></div>
              <div className="hero-stat"><strong>автоматический ритм</strong><span>обновление без ручных действий</span></div>
              <div className="hero-stat"><strong>видимая устойчивость</strong><span>мониторинг и документация</span></div>
            </div>
            <div className="hero-route" aria-label="Подтверждённый маршрут данных"><span>route / 01</span><strong>source → verified mart</strong><i /></div>
          </div>
        </section>

        <div className="strip" aria-label="Технологические области">
          <div className="strip-inner">
            <span>data sources</span><span className="strip-dot">✦</span><span>quality gates</span><span className="strip-dot">✦</span><span>data marts</span><span className="strip-dot">✦</span><span>docker + k8s</span><span className="strip-dot">✦</span><span>monitoring</span><span className="strip-dot">✦</span><span>architecture poc</span>
          </div>
        </div>

        <section className="intro grid-rule">
          <div className="section-shell intro-layout">
            <div><span className="section-number">00 / МАНИФЕСТ</span></div>
            <div>
              <p className="intro-lead">Не просто загружаем данные. Создаём понятную систему, в которой можно увидеть источник, проверить расчёт и объяснить решение.</p>
              <p className="intro-text">Разрозненные таблицы, файлы и сервисы становятся единым рабочим пространством для инженеров, аналитиков и владельцев процессов. Каждая витрина получает маршрут, владельца и правила качества.</p>
              <span className="statement-stamp"><CheckCircle2 size={17} /> контекст → проверка → действие</span>
            </div>
          </div>
        </section>

        <section className="capabilities" aria-labelledby="capability-title">
          <div className="section-shell">
            <div className="section-meta"><span className="section-number">01 / СИСТЕМА</span><span className="eyebrow">Зона ответственности</span><i /></div>
            <h2 className="section-title" id="capability-title">Инженерная дисциплина на каждом шаге данных.</h2>
            <div className="capability-grid">
              {capabilities.map(({ icon: Icon, title, copy, index }) => (
                <article className="capability" key={title}>
                  <span className="cap-index">{index}</span>
                  <div className="cap-icon"><Icon size={20} strokeWidth={1.8} /></div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="architecture" id="contour" aria-labelledby="contour-title">
          <div className="section-shell architecture-layout">
            <div>
              <div className="section-meta"><span className="section-number">02 / DWH</span><span className="eyebrow">Контур данных</span><i /></div>
              <h2 className="section-title" id="contour-title">Одна траектория — от источника до решения.</h2>
              <p className="section-copy">Мы связываем данные в наблюдаемую цепочку. На каждом переходе остаются правила, проверки и ответственный контекст.</p>
              <div className="flow-map" aria-label="Схема потока данных">
                <div className="flow-row">
                  <div className="flow-node"><small>вход</small><strong>Источники</strong><span>PostgreSQL · ClickHouse</span></div>
                  <div className="flow-arrow" aria-hidden="true" />
                  <div className="flow-node"><small>Greenplum</small><strong>Staging</strong><span>ETL / ELT слой</span></div>
                  <div className="flow-arrow" aria-hidden="true" />
                  <div className="flow-node verified"><small>модель</small><strong>Data Vault</strong><span>dbt · правила · история</span></div>
                  <div className="flow-arrow" aria-hidden="true" />
                  <div className="flow-node"><small>выход</small><strong>Витрины</strong><span>аналитики · продукты</span></div>
                </div>
                <p className="flow-caption mono">Greenplum DWH / Airflow DAGs / Soda Core / lineage / refresh rhythm</p>
                <div className="v-signature" aria-hidden="true"><i /><i /><i /></div>
              </div>
            </div>

            <aside className="architecture-aside" id="poc">
              <span className="section-number">АРХИТЕКТУРНЫЙ POC</span>
              <h3>Сначала доказываем путь. Затем масштабируем.</h3>
              <p>Предлагаем решение, фиксируем критерии успеха и собираем короткий POC, который отвечает на технические риски до большой реализации: от DWH-маршрута до способа запуска в Kubernetes.</p>
              {pocOpen && (
                <div className="poc-reveal" aria-live="polite">
                  <div className="poc-cell"><strong>Гипотеза</strong><span>Какой маршрут данных или сервисный подход проверяем.</span></div>
                  <div className="poc-cell"><strong>Критерий</strong><span>Что считаем техническим и бизнес-результатом.</span></div>
                  <div className="poc-cell"><strong>Контур</strong><span>Минимальный Docker/Kubernetes-маршрут, Greenplum DWH, Airflow и мониторинг.</span></div>
                  <div className="poc-cell"><strong>Решение</strong><span>Обоснование: внедрять, доработать или выбрать другой путь.</span></div>
                </div>
              )}
              <button className="poc-toggle" type="button" onClick={() => setPocOpen((value) => !value)} aria-expanded={pocOpen}>
                {pocOpen ? "Свернуть контур POC" : "Раскрыть контур POC"} <ArrowDownRight size={16} />
              </button>
            </aside>
          </div>
        </section>

        <section className="operations" id="operations" aria-labelledby="operations-title">
          <div className="section-shell">
            <div className="section-meta"><span className="section-number">03 / РИТМ</span><span className="eyebrow">Рабочий цикл</span><i /></div>
            <h2 className="section-title" id="operations-title">Пайплайн — это не один запуск. Это поддерживаемый процесс.</h2>
            <div className="operations-grid">
              <div className="operations-list">
                {operations.map(([num, title, copy, Icon]) => (
                  <article className="operation" key={num}>
                    <span className="operation-num">{num}</span>
                    <div><strong>{title}</strong><p>{copy}</p></div>
                    <Icon size={19} strokeWidth={1.65} />
                  </article>
                ))}
              </div>
              <div className="operations-visual">
                <img src={assets.validation} alt="Абстрактный процесс проверки данных" />
                <span className="evidence-label evidence-top">quality gate / soda core</span>
                <span className="evidence-line" aria-hidden="true" />
                <span className="visual-tag">Soda Core, мониторинг и разбор инцидентов не скрывают ошибки — они делают их видимыми до того, как данные попадут в решение.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="registry" id="registry" aria-labelledby="registry-title">
          <div className="section-shell">
            <div className="registry-panel">
              <img src={assets.registry} alt="Абстрактная структура реестра витрин данных" />
              <span className="registry-evidence">lineage / controlled</span>
              <div className="registry-content">
                <div className="section-meta"><span className="section-number">04 / КАТАЛОГ</span><span className="eyebrow">Реестр витрин</span><i /></div>
                <h2 id="registry-title">Знание о данных — тоже инфраструктура.</h2>
                <p>Ведём понятный реестр: где живёт витрина, для какого вопроса нужна, какие источники использует, как обновляется, какие проверки уже встроены и какой регламент восстановления действует при инциденте.</p>
                <div className="registry-tags"><span>owner</span><span>source lineage</span><span>refresh SLA</span><span>quality rule</span><span>incident runbook</span><span>change log</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="excel" aria-labelledby="excel-title">
          <div className="section-shell excel-layout">
            <div className="excel-art"><img src={assets.excel} alt="Абстрактная композиция аналитических расчётов" /><span className="excel-evidence">model / cross-check</span></div>
            <div className="excel-copy">
              <div className="section-meta"><span className="section-number">05 / ПРАКТИКА</span><span className="eyebrow">Excel — уверенно</span><i /></div>
              <h2 id="excel-title">Там, где решение начинается в таблице.</h2>
              <p>Не противопоставляем Excel инженерному контуру. Используем его как сильный аналитический инструмент: для быстрых проверок, сверок, промежуточных расчётов и понятной коммуникации с бизнесом.</p>
              <ul className="excel-check">
                <li><Check size={17} /> логика расчётов</li>
                <li><Check size={17} /> проверка выгрузок</li>
                <li><Check size={17} /> сводные отчёты</li>
                <li><Check size={17} /> аккуратные модели</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="case-study" id="case" aria-labelledby="case-title">
          <div className="section-shell">
            <div className="case-topline">
              <div className="section-meta"><span className="section-number">06 / КЕЙС</span><span className="eyebrow">Логистика и транспорт</span><i /></div>
              <span className="case-nda">NDA / клиент обезличен</span>
            </div>
            <div className="case-heading">
              <h2 id="case-title">Единая аналитическая платформа для логистической компании.</h2>
              <p>Консолидировали операционные, финансовые и HR-данные в контур <strong>Sources → Staging → Data Vault → Data Marts → BI</strong>. Результат — устойчивые витрины для Power BI и управленческой отчётности.</p>
            </div>

            <div className="case-grid">
              <div className="case-results">
                <div className="result-lead"><span>регулярная отчётность</span><strong>15–20 мин</strong><small>вместо нескольких часов</small></div>
                <div className="result-mini"><strong>~70%</strong><span>меньше ручных операций</span></div>
                <div className="result-mini"><strong>30+</strong><span>автоматизированных проверок качества</span></div>
                <div className="case-proof"><span className="mono">измеримый эффект</span><p>Управленческие отчёты стали обновляться в предсказуемом автоматическом ритме, а контроль качества был встроен в маршрут данных до публикации витрин.</p></div>
              </div>

              <div className="case-system">
                <span className="case-system-label">производственный контур</span>
                <div className="case-route-map" aria-label="Архитектура проекта">
                  <span>12 источников</span><i /><span>Greenplum DWH</span><i /><span>40+ витрин</span><i /><span>Power BI</span>
                </div>
                <div className="case-stack"><span>PostgreSQL</span><span>ClickHouse</span><span>Python</span><span>dbt</span><span>Airflow</span><span>Soda Core</span><span>Docker</span><span>Kubernetes</span><span>GitHub Actions</span></div>
                <dl className="case-facts">
                  <div><dt>Период</dt><dd>8 месяцев</dd></div>
                  <div><dt>Объём</dt><dd>~50 млн записей</dd></div>
                  <div><dt>Приток</dt><dd>до 200 тыс. / сутки</dd></div>
                  <div><dt>Компоненты</dt><dd>POC → запуск</dd></div>
                </dl>
              </div>
            </div>

            <div className="case-footer"><span className="mono">scope</span><p>Проектирование · POC · разработка · миграция · промышленный запуск · мониторинг · обработка инцидентов</p><ArrowDownRight size={19} /></div>
          </div>
        </section>

        <section className="crypto-case" aria-labelledby="crypto-title">
          <div className="section-shell crypto-layout">
            <div className="crypto-intro">
              <div className="section-meta"><span className="section-number">07 / OPEN SOURCE</span><span className="eyebrow">Pet / Portfolio project</span><i /></div>
              <h2 id="crypto-title">End-to-end DWH pipeline для криптовалютных данных.</h2>
              <p>Автоматизировали полный путь ценовых данных BTC-USD и ETH-USD: от Coinbase API до аналитической выдачи в ClickHouse и BI.</p>
              <div className="crypto-route mono"><span>Coinbase API</span><i /><span>MinIO / S3</span><i /><span>PostgreSQL / Greenplum</span><i /><span>dbt</span><i /><span>ClickHouse</span><i /><span>BI</span></div>
              <p className="crypto-note"><span>Открытый проект.</span> Код и данные организованы как воспроизводимый Data Engineering-контур: ingestion → storage → staging → transformation → quality → serving → orchestration → CI/CD.</p>
            </div>
            <div className="crypto-evidence">
              <div className="crypto-schedule"><span>scheduler</span><strong>hourly</strong><small>Extract → Load → dbt Build → Sync</small></div>
              <div className="crypto-checks">
                <div><small>raw layer</small><strong>append-only</strong><span>MinIO / S3 + точные S3 keys в Airflow XCom</span></div>
                <div><small>serving</small><strong>idempotent</strong><span>ReplacingMergeTree + окно late-arriving данных 48 ч</span></div>
                <div><small>quality</small><strong>tested</strong><span>dbt tests, pytest, проверки аномальных цен и CI</span></div>
              </div>
              <div className="crypto-stack"><span>Python</span><span>SQL</span><span>Airflow</span><span>dbt</span><span>MinIO</span><span>Docker</span><span>GitHub Actions</span><span>Ruff</span></div>
            </div>
          </div>
        </section>

        <section className="request-section" id="request" aria-labelledby="request-title">
          <div className="section-shell request-layout">
            <div className="request-copy">
              <div className="section-meta"><span className="section-number">08 / ЗАЯВКА</span><span className="eyebrow">Первый контакт</span><i /></div>
              <h2 id="request-title">Начнём с задачи, а не со стека.</h2>
              <p>Опишите контур, витрину или архитектурную гипотезу. Сформируем письмо с вашим брифом и отправим его напрямую команде.</p>
              <div className="request-aside"><span className="mono">Адрес для заявки</span><strong>ivan8597@yandex.ru</strong><small>После отправки откроется ваше почтовое приложение — текст письма уже будет заполнен.</small></div>
            </div>
            <form className="request-form" onSubmit={sendRequest}>
              <label><span>Как к вам обращаться *</span><input required value={request.name} onChange={(event) => setRequest({ ...request, name: event.target.value })} placeholder="Имя" /></label>
              <label><span>Компания или роль</span><input value={request.company} onChange={(event) => setRequest({ ...request, company: event.target.value })} placeholder="Например, руководитель BI" /></label>
              <label><span>Контакт для ответа *</span><input required type="email" value={request.email} onChange={(event) => setRequest({ ...request, email: event.target.value })} placeholder="name@company.ru" /></label>
              <label><span>Что нужно обсудить</span><select value={request.topic} onChange={(event) => setRequest({ ...request, topic: event.target.value })}><option>Архитектурный POC</option><option>Построение DWH</option><option>Витрины и качество данных</option><option>Оркестрация и мониторинг</option><option>Другое</option></select></label>
              <label className="request-message"><span>Коротко о задаче *</span><textarea required value={request.message} onChange={(event) => setRequest({ ...request, message: event.target.value })} placeholder="Источники, текущая сложность, ожидаемый результат…" /></label>
              <div className="request-action"><button className="primary-btn" type="submit">Сформировать заявку <ArrowRight size={17} /></button><span aria-live="polite">{requestStatus || "Без регистрации; чат обрабатывается по политике данных."}</span></div>
            </form>
          </div>
        </section>

        <section className="final-cta" id="contact" aria-labelledby="contact-title">
          <div className="section-shell final-inner">
            <div>
              <div className="section-meta"><span className="section-number">09 / СТАРТ</span><span className="eyebrow">Следующий шаг</span><i /></div>
              <h2 id="contact-title">Соберём контур, который выдержит рост данных.</h2>
            </div>
            <div className="final-side">
              <p>Начните с одной витрины, процесса обновления или архитектурной гипотезы. Зафиксируем источники, риски, критерии качества и путь к устойчивой реализации.</p>
              <div className="final-buttons">
                <a className="primary-btn" href="#request">Обсудить контур <ArrowRight size={17} /></a>
                <button className="secondary-btn" type="button" onClick={copyBrief}><TerminalSquare size={16} /> Скопировать бриф</button>
              </div>
              <span className="copy-note" aria-live="polite">{copied ? "Бриф скопирован в буфер обмена" : "Короткий бриф: единый контур данных"}</span>
            </div>
          </div>
        </section>
      </main>

      <AnalyticsAssistant />
      <footer className="site-footer"><div className="footer-inner"><span>Витрина данных / инженерная аналитика</span><span>источник → качество → витрина → решение</span></div></footer>
    </div>
  );
}
