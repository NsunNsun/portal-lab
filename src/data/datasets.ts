import type { Portal } from '../domain/types'

export interface Dataset {
  key: string
  name: string
  portals: Portal[]
}

/**
 * Demo datasets. Deliberately static: no Date.now(), no randomness, so a demo
 * run is always reproducible. Portal ids are stable across datasets' scope.
 */

/** Small helper so each fixture reads as a table of the interesting fields. */
function portal(
  p: Omit<Portal, 'history' | 'surveyed' | 'rescuerSent'> &
    Partial<Pick<Portal, 'history' | 'surveyed' | 'rescuerSent'>>,
): Portal {
  return { history: [], surveyed: true, rescuerSent: false, ...p }
}

const normal: Dataset = {
  key: 'normal',
  name: 'Обычная смена',
  portals: [
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
    // Два неразведанных портала: параметры заданы, но surveyed:false —
    // интерфейс их скрывает, пока не отправят наблюдателя.
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
    // Портал для полного сценария: стабилизировать → спасатель → эвакуировать →
    // закрыть. Стартовый риск критический (90); одной стабилизации хватает, чтобы
    // опустить его до 71 — тогда спасателя уже можно отправить.
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
    }),
    portal({
      id: 'n8',
      name: 'Угасшая Звезда',
      world: 'Ниррат',
      energy: 30,
      stability: 40,
      hoursToCollapse: 0,
      creaturesInside: 0,
      status: 'closed',
      observerSent: false,
    }),
  ],
}

const empty: Dataset = {
  key: 'empty',
  name: 'Пустая лаборатория',
  portals: [],
}

// «Красный день»: пять разведанных порталов, каждый ≥ 85 по НОВОЙ формуле долей.
// Значения пересчитаны — старые потолки max(85) больше не действуют.
const critical: Dataset = {
  key: 'critical',
  name: 'Красный день',
  portals: [
    portal({
      id: 'c1',
      name: 'Треснувшее Небо',
      world: 'Гхол-Марр',
      energy: 65,
      stability: 8, // критическая нестабильность → 86
      hoursToCollapse: 18,
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c2',
      name: 'Последняя Секунда',
      world: 'Овринт',
      energy: 60,
      stability: 30,
      hoursToCollapse: 1, // вот-вот схлопнется → 85
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c3',
      name: 'Кровавый Разлом',
      world: 'Дракх-Уул',
      energy: 40,
      stability: 10, // нестабильность + время → 92
      hoursToCollapse: 1,
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c4',
      name: 'Голодная Бездна',
      world: 'Сумеречный Иллат',
      energy: 100, // предельная нагрузка + время + существа → 90
      stability: 25,
      hoursToCollapse: 4,
      creaturesInside: 2,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c5',
      name: 'Воющее Пламя',
      world: 'Фарзан-Кор',
      energy: 95, // высокий базовый риск + время → 90
      stability: 20,
      hoursToCollapse: 3,
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
  ],
}

export const DATASETS: Dataset[] = [normal, empty, critical]

/** Compact list for dataset pickers. */
export const DATASET_OPTIONS = DATASETS.map(({ key, name }) => ({ key, name }))

export const DEFAULT_DATASET_KEY = 'normal'

/** Look up a dataset by key, falling back to the default set. */
export function getDataset(key: string): Dataset {
  return DATASETS.find((d) => d.key === key) ?? DATASETS[0]!
}
