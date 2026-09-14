import type { Portal } from '../domain/types'

/**
 * Static starting data for a shift. Deliberately deterministic: no Date.now(),
 * no randomness here. Runtime dynamics (new portals appearing) live in the
 * reducer and draw from the seeded generator in domain/random.ts.
 */

/** Small helper so each fixture reads as a table of the interesting fields. */
function portal(
  p: Omit<Portal, 'history' | 'surveyed' | 'rescuerSent' | 'spawnedAtHour'> &
    Partial<Pick<Portal, 'history' | 'surveyed' | 'rescuerSent' | 'spawnedAtHour'>>,
): Portal {
  return { history: [], surveyed: true, rescuerSent: false, spawnedAtHour: 0, ...p }
}

/**
 * «Новая смена» — the starting board. Eight portals, none closed: closed
 * portals now appear naturally as time runs out. A spread of levels, two
 * plainly unsurveyed portals, and one unsurveyed portal with creatures that
 * starts critical — the full rescue scenario runs on it.
 */
export const NEW_SHIFT_PORTALS: Portal[] = [
  portal({
    id: 'n1',
    name: 'Тихий Изумруд',
    world: 'Селенвир',
    energy: 20,
    stability: 90,
    hoursToCollapse: 60,
    creaturesInside: 0,
    status: 'open',
    observerSent: false,
  }),
  portal({
    id: 'n2',
    name: 'Дремлющий Оникс',
    world: 'Валин-Ра',
    energy: 40,
    stability: 72,
    hoursToCollapse: 34,
    creaturesInside: 0,
    status: 'open',
    observerSent: false,
  }),
  portal({
    id: 'n3',
    name: 'Серый Прилив',
    world: 'Морндаль',
    energy: 55,
    stability: 60,
    hoursToCollapse: 30,
    creaturesInside: 0,
    status: 'open',
    observerSent: false,
  }),
  portal({
    id: 'n4',
    name: 'Медное Эхо',
    world: 'Кассавир',
    energy: 55,
    stability: 58,
    hoursToCollapse: 26,
    creaturesInside: 0,
    status: 'questioned',
    observerSent: true, // наблюдатель уже внутри — виден бейдж «Набл.»
  }),
  portal({
    id: 'n5',
    name: 'Ржавый Ветер',
    world: 'Тарнак',
    energy: 75,
    stability: 45,
    hoursToCollapse: 12,
    creaturesInside: 0,
    status: 'open',
    observerSent: false,
  }),
  // Неразведанные: параметры заданы, но surveyed:false — интерфейс их скрывает.
  portal({
    id: 'nu1',
    name: 'Мглистый Порог',
    world: 'Аэлль-Тан',
    energy: 62,
    stability: 38,
    hoursToCollapse: 22,
    creaturesInside: 1,
    status: 'open',
    observerSent: false,
    surveyed: false,
  }),
  portal({
    id: 'nu2',
    name: 'Шёпот За Гранью',
    world: 'Ниррат',
    energy: 34,
    stability: 71,
    hoursToCollapse: 44,
    creaturesInside: 0,
    status: 'open',
    observerSent: false,
    surveyed: false,
  }),
  // Сценарный портал: неразведан, с существами, скрыто-критический. Разведка →
  // стабилизация (одной хватает: 90 → 73) → спасатель → эвакуация → закрытие.
  // Времени с запасом (16 ч), поэтому фактор времени риск не «прибивает».
  portal({
    id: 'n7',
    name: 'Зелёный Голод',
    world: 'Вельзор',
    energy: 85,
    stability: 18,
    hoursToCollapse: 16,
    creaturesInside: 3,
    status: 'open',
    observerSent: false,
    surveyed: false,
  }),
]

/**
 * Name pool for portals that appear during a shift. Picked in generator order
 * among the unused ones; once exhausted a Roman numeral is appended (see the
 * reducer). Atmospheric, original — no references to existing franchises.
 */
export const SPAWN_NAMES: { name: string; world: string }[] = [
  { name: 'Хрустальная Трещина', world: 'Ирмалон' },
  { name: 'Пепельный Зев', world: 'Корвадат' },
  { name: 'Полуночный Свод', world: 'Аскаэль' },
  { name: 'Стеклянный Провал', world: 'Веларн' },
  { name: 'Тёмный Исток', world: 'Гронмир' },
  { name: 'Бирюзовый Надлом', world: 'Сельдана' },
  { name: 'Ледяная Печать', world: 'Хаггрим' },
  { name: 'Алый Пролом', world: 'Вантрел' },
  { name: 'Сумрачный Портал', world: 'Оздарин' },
  { name: 'Янтарный Разрыв', world: 'Кеммаль' },
  { name: 'Соляной Вихрь', world: 'Тарисфен' },
  { name: 'Зеркальная Брешь', world: 'Иннувар' },
  { name: 'Тлеющий Круг', world: 'Драгаст' },
  { name: 'Северный Пролом', world: 'Морндаль' },
  { name: 'Багряный Зев', world: 'Ульфанг' },
  { name: 'Шёлковый Разлом', world: 'Валлеан' },
]
