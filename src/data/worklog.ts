/**
 * Structured AI worklog data, rendered on the «AI Worklog» tab.
 * Only real facts from the two completed stages. Time/token fields are TODO
 * until a human fills them; the rest we write elsewhere.
 */

export interface WorklogSummary {
  tools: string[]
  totalTime: string
  tokens: string
  submittedAt: string
}

export interface WorklogStage {
  name: string
  time: string
  human: string
  ai: string
  prompt: string
}

export interface WorklogDecision {
  title: string
  why: string
  rejected: string
}

export interface WorklogMistake {
  what: string
  fix: string
}

export interface WorklogVerification {
  scenario: string
  expected: string
  done: boolean
}

export interface Worklog {
  summary: WorklogSummary
  stages: WorklogStage[]
  decisions: WorklogDecision[]
  aiMistakes: WorklogMistake[]
  manualRewrites: string[]
  verification: WorklogVerification[]
  improvements: string[]
}

export const worklog: Worklog = {
  summary: {
    tools: ['Claude Code (Opus 4.8)', 'Vite', 'React', 'TypeScript', 'Tailwind CSS', 'Vitest'],
    totalTime: 'TODO',
    tokens: 'TODO',
    submittedAt: '2026-09-14',
  },
  stages: [
    {
      name: 'Этап 1. Каркас проекта и доменная логика',
      time: 'TODO',
      human:
        'Поставил задачу: развернуть проект (Vite + React + TS + Tailwind + Vitest), собрать доменный слой чистыми функциями, тесты и документацию. UI явно отложил на следующий шаг.',
      ai:
        'Развернул portal-lab вручную по файлам (без интерактивных мастеров), установил зависимости, реализовал types/risk/rules/recommend/reducer, три демо-набора, 12 тестов Vitest, CLAUDE.md и WORKLOG.md, поэтапные коммиты.',
      prompt:
        'НЕ делай интерфейс — только каркас, доменная логика и тесты. Формула риска с разбором, правила действий, reducer с проверкой правил внутри, детерминированные демо-данные.',
    },
    {
      name: 'Этап 2. Интерфейс',
      time: 'TODO',
      human:
        'Поставил задачу собрать UI поверх готовых доменных функций: тёмная тема с палитрой в CSS-переменных, таблица порталов, карточка с разбором риска, действия с тостами и подтверждением, журнал событий, вкладка AI Worklog, адаптивность и доступность. Без новых зависимостей.',
      ai:
        'Собрал слой src/ui из маленьких компонентов (по файлу на компонент), состояние в useReducer поверх applyAction/advanceHour/loadDataset, палитру по ролям через CSS-переменные, тосты с aria-live, модальное подтверждение с Esc и фокусом на «Отмена», адаптив таблица→карточки ниже 900px. Бизнес-логику не дублировал — только вызовы доменных функций.',
      prompt:
        'Никаких новых зависимостей. Цвет никогда не несёт смысл в одиночку — риск всегда значок + слово + число. Запрещённые действия не disabled: кликабельны, приглушены, показывают тост и пишут отказ в журнал.',
    },
  ],
  decisions: [
    {
      title: 'Палитра как CSS-переменные, используемые по ролям',
      why: 'Один источник правды для цветов; компоненты обращаются к var(--role), а не к хексам — тему легко проверить на контраст и поменять.',
      rejected: 'Хардкод цветов в компонентах или конфиг Tailwind theme.extend с именами цветов.',
    },
    {
      title: 'Проверка правил остаётся в доменном reducer, а не в UI',
      why: 'Кнопки действий лишь вызывают доменные функции; UI не может обойти запрет, а запрещённые действия всё равно логируются.',
      rejected: 'Прятать запрещённые действия через disabled — тогда смотритель не видит причину отказа.',
    },
    {
      title: 'Тосты и подтверждение оркестрируются в App',
      why: 'Обработчик читает checkAction, решает: показать тост-отказ, открыть подтверждение или применить действие. Компоненты остаются без бизнес-логики.',
      rejected: 'Глобальный контекст тостов — избыточен, триггер только один (действия над порталом).',
    },
    {
      title: 'Адаптив через JS-хук useMediaQuery на 900px',
      why: 'Порог 900px не входит в дефолтные брейкпоинты Tailwind; хук переключает таблицу на список карточек без горизонтального скролла.',
      rejected: 'Кастомный брейкпоинт в конфиге Tailwind — менее прозрачно для одного места.',
    },
  ],
  aiMistakes: [
    {
      what: 'В visuals.ts при первом наборе иконка для типа «отказ» получилась битым символом.',
      fix: 'Заменил на «✕» сразу после написания файла, до сборки.',
    },
  ],
  manualRewrites: [
    'Поверх сгенерированного кода ручных перезаписей не потребовалось; правки шли через инструмент правок в тех же файлах.',
  ],
  verification: [
    {
      scenario: 'npm test',
      expected: '3 файла, 12 тестов, все зелёные.',
      done: true,
    },
    {
      scenario: 'npx tsc --noEmit при строгом tsconfig',
      expected: 'Без ошибок типов (exit 0).',
      done: true,
    },
    {
      scenario: 'Набор «Пустая лаборатория»',
      expected: 'Плитки сводки показывают нули, вместо таблицы — блок пустого состояния, ничего не ломается.',
      done: true,
    },
    {
      scenario: 'Набор «Красный день»',
      expected: 'Все порталы с уровнем риска critical, отсортированы по убыванию риска.',
      done: true,
    },
    {
      scenario: 'Отправка наблюдателя в критический портал',
      expected: 'Отказ: тост с причиной из checkAction, запись «отказ» в журнале, портал не изменился.',
      done: true,
    },
    {
      scenario: 'Закрытие портала с существами внутри',
      expected: 'Модальное подтверждение с текстом confirm; «Отмена» ничего не меняет и не пишет в журнал.',
      done: true,
    },
    {
      scenario: 'Кнопка «Прошёл час»',
      expected: 'У незакрытых порталов убывает время и стабильность; портал с истёкшим временем схлопывается.',
      done: true,
    },
  ],
  improvements: [
    'Инъекция «часов» и генератора id в reducer — сделать домен полностью чистым и детерминированным в тестах.',
    'Персистентность состояния (URL или экспорт/импорт сцены) для разбора инцидентов.',
    'Валидация границ входных данных портала (0..100, 0..72) на входе датасетов.',
    'Расширить тестовое покрытие на recommend.ts и ветки loadDataset.',
  ],
}
