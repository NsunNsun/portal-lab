import { describe, it, expect } from 'vitest'
import { applyAction, advanceHour } from '../domain/reducer'
import { makePortal, makeState } from './helpers'

function stateWith(...portals: ReturnType<typeof makePortal>[]) {
  return makeState(portals)
}

describe('applyAction', () => {
  it('отправка наблюдателя делает портал разведанным и пишет запись о разведке', () => {
    const before = makePortal({ id: 'p', surveyed: false, energy: 62, stability: 38, creaturesInside: 1 })
    const next = applyAction(stateWith(before), 'p', 'sendObserver')
    const after = next.portals.find((p) => p.id === 'p')!

    expect(after.surveyed).toBe(true)
    expect(after.observerSent).toBe(true)
    expect(after.history).toHaveLength(2)
    expect(after.history.some((h) => h.message.startsWith('Разведка проведена'))).toBe(true)
    expect(after.history.find((h) => h.message.startsWith('Разведка проведена'))!.message).toBe(
      'Разведка проведена: энергия 62, стабильность 38, существ внутри 1',
    )
    expect(next.log[0]?.kind).toBe('action')
  })

  it('повторная отправка наблюдателя в уже разведанный портал не добавляет запись о разведке', () => {
    const before = makePortal({ id: 'p', surveyed: true, observerSent: false })
    const next = applyAction(stateWith(before), 'p', 'sendObserver')
    const after = next.portals.find((p) => p.id === 'p')!
    expect(after.history).toHaveLength(1)
    expect(after.history.some((h) => h.message.startsWith('Разведка проведена'))).toBe(false)
  })

  it('эвакуация обнуляет существ и выводит спасателя', () => {
    const before = makePortal({ id: 'p', creaturesInside: 3, rescuerSent: true, stability: 60, energy: 40 })
    const next = applyAction(stateWith(before), 'p', 'evacuate')
    const after = next.portals.find((p) => p.id === 'p')!

    expect(after.creaturesInside).toBe(0)
    expect(after.rescuerSent).toBe(false)
    expect(next.log[0]?.message).toBe('Эвакуировано существ: 3. Спасатель вышел вместе с ними.')
  })

  it('запрещённое действие не меняет портал, но добавляет запись blocked', () => {
    const closed = makePortal({ id: 'p', status: 'closed' })
    const next = applyAction(stateWith(closed), 'p', 'stabilize')
    const after = next.portals.find((p) => p.id === 'p')!

    expect(after).toEqual(closed)
    expect(next.log[0]?.kind).toBe('blocked')
    expect(next.log[0]?.message).toBe('Портал закрыт — стабилизировать нечего.')
  })
})

describe('advanceHour', () => {
  it('пишет подробную телеметрию для портала с наблюдателем и короткую для остальных', () => {
    const watched = makePortal({ id: 'a', observerSent: true, hoursToCollapse: 12, stability: 50, energy: 70 })
    const plain = makePortal({ id: 'b', observerSent: false, hoursToCollapse: 12, stability: 50 })
    const next = advanceHour(stateWith(watched, plain))

    const a = next.portals.find((p) => p.id === 'a')!
    const b = next.portals.find((p) => p.id === 'b')!

    expect(a.history[0]!.message).toContain('Стабильность 50→47')
    expect(a.history[0]!.message).toContain('риск')
    expect(a.history[0]!.message).toContain('до схлопывания 12→11 ч')
    expect(b.history[0]!.message).toBe('Час прошёл.')
  })

  it('схлопывание закрывает портал и сбрасывает флаги людей внутри', () => {
    const dying = makePortal({
      id: 'p',
      hoursToCollapse: 1,
      stability: 50,
      creaturesInside: 2,
      observerSent: true,
      rescuerSent: true,
    })
    const next = advanceHour(stateWith(dying))
    const after = next.portals.find((p) => p.id === 'p')!

    expect(after.hoursToCollapse).toBe(0)
    expect(after.status).toBe('closed')
    expect(after.observerSent).toBe(false)
    expect(after.rescuerSent).toBe(false)
    expect(
      next.log.some(
        (e) => e.kind === 'system' && e.message.startsWith('Портал схлопнулся. Внутри оставались:'),
      ),
    ).toBe(true)
    expect(next.log.some((e) => e.kind === 'system' && e.message === 'Прошёл час')).toBe(true)
  })
})
