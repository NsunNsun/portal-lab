import { describe, it, expect } from 'vitest'
import { sortPortals } from '../domain/sort'
import { makePortal } from './helpers'

describe('sortPortals', () => {
  it('закрытый (даже неразведанный) портал оказывается ниже открытых', () => {
    const closedUnsurveyed = makePortal({
      id: 'c',
      name: 'Закрытый',
      status: 'closed',
      surveyed: false,
    })
    const openCalm = makePortal({
      id: 'o',
      name: 'Открытый',
      status: 'open',
      surveyed: true,
      stability: 90,
      energy: 10,
      hoursToCollapse: 60,
    })
    expect(sortPortals([closedUnsurveyed, openCalm]).map((p) => p.id)).toEqual(['o', 'c'])
  })

  it('помеченный «под вопросом» оказывается выше портала с более высоким риском', () => {
    const questionedCalm = makePortal({
      id: 'q',
      name: 'Сомнительный',
      status: 'questioned',
      stability: 95,
      energy: 5,
      hoursToCollapse: 70,
    })
    const openDangerous = makePortal({
      id: 'd',
      name: 'Опасный',
      status: 'open',
      stability: 10,
      energy: 95,
      hoursToCollapse: 3,
    })
    expect(sortPortals([openDangerous, questionedCalm]).map((p) => p.id)).toEqual(['q', 'd'])
  })

  it('неразведанный открытый — выше разведанных, но ниже «под вопросом»', () => {
    const questioned = makePortal({ id: 'q', name: 'Вопрос', status: 'questioned' })
    const unsurveyed = makePortal({ id: 'u', name: 'Тьма', status: 'open', surveyed: false })
    const surveyed = makePortal({ id: 's', name: 'Ясный', status: 'open', surveyed: true })
    expect(sortPortals([surveyed, unsurveyed, questioned]).map((p) => p.id)).toEqual([
      'q',
      'u',
      's',
    ])
  })

  it('среди открытых разведанных — по убыванию риска', () => {
    const high = makePortal({ id: 'h', name: 'Б', stability: 20, energy: 90, hoursToCollapse: 10 })
    const low = makePortal({ id: 'l', name: 'А', stability: 90, energy: 10, hoursToCollapse: 60 })
    expect(sortPortals([low, high]).map((p) => p.id)).toEqual(['h', 'l'])
  })
})
