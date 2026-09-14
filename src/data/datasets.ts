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
function portal(p: Omit<Portal, 'history'> & Partial<Pick<Portal, 'history'>>): Portal {
  return { history: [], ...p }
}

const normal: Dataset = {
  key: 'normal',
  name: 'Обычная смена',
  portals: [
    portal({
      id: 'n1',
      name: 'Портал Тихого Изумруда',
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
      name: 'Портал Лунного Брода',
      world: 'Аэлль-Тан',
      energy: 30,
      stability: 85,
      hoursToCollapse: 48,
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'n3',
      name: 'Портал Серого Прилива',
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
      name: 'Портал Медного Эха',
      world: 'Кассавир',
      energy: 60,
      stability: 55,
      hoursToCollapse: 24,
      creaturesInside: 0,
      status: 'questioned',
      observerSent: true,
    }),
    portal({
      id: 'n5',
      name: 'Портал Ржавого Ветра',
      world: 'Тарнак',
      energy: 75,
      stability: 45,
      hoursToCollapse: 12,
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'n6',
      name: 'Портал Багрового Шёпота',
      world: 'Керн-Аллат',
      energy: 80,
      stability: 12,
      hoursToCollapse: 10,
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'n7',
      name: 'Портал Зелёного Голода',
      world: 'Вельзор',
      energy: 65,
      stability: 22,
      hoursToCollapse: 2,
      creaturesInside: 4,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'n8',
      name: 'Портал Угасшей Звезды',
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

const critical: Dataset = {
  key: 'critical',
  name: 'Красный день',
  portals: [
    portal({
      id: 'c1',
      name: 'Портал Треснувшего Неба',
      world: 'Гхол-Марр',
      energy: 55,
      stability: 8, // критическая нестабильность
      hoursToCollapse: 18,
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c2',
      name: 'Портал Последней Секунды',
      world: 'Овринт',
      energy: 45,
      stability: 62,
      hoursToCollapse: 1, // вот-вот схлопнется
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c3',
      name: 'Портал Кровавого Разлома',
      world: 'Дракх-Уул',
      energy: 40,
      stability: 10, // и нестабильность,
      hoursToCollapse: 1, // и время
      creaturesInside: 0,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c4',
      name: 'Портал Голодной Бездны',
      world: 'Сумеречный Иллат',
      energy: 100, // предельная нагрузка + существа
      stability: 25,
      hoursToCollapse: 4,
      creaturesInside: 2,
      status: 'open',
      observerSent: false,
    }),
    portal({
      id: 'c5',
      name: 'Портал Воющего Пламени',
      world: 'Фарзан-Кор',
      energy: 95, // высокий базовый риск без жёстких модификаторов
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
