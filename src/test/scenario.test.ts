import { describe, it, expect } from 'vitest'
import { startShift, applyAction } from '../domain/reducer'
import { checkAction } from '../domain/rules'
import { computeRisk } from '../domain/risk'

/**
 * End-to-end walk of the rescue lifecycle on the real starting board. Runs
 * through the domain rules and effects, asserting each step is permitted. It
 * fails if the scenario portal cannot leave the critical level within a sane
 * number of stabilizations — a guard on the starting parameters, not the rules.
 */
describe('полный сценарий спасения на стартовом портале с существами', () => {
  it('разведка → стабилизация → спасатель → эвакуация → закрытие проходит по правилам', () => {
    let state = startShift('new')
    const id = 'n7'
    const get = () => state.portals.find((p) => p.id === id)!

    // Стартовый портал с существами и неразведан.
    expect(get().creaturesInside).toBeGreaterThan(0)
    expect(get().surveyed).toBe(false)

    // 1. Разведка наблюдателем.
    expect(checkAction(get(), 'sendObserver').allowed).toBe(true)
    state = applyAction(state, id, 'sendObserver')
    expect(get().surveyed).toBe(true)

    // 2. Стабилизация столько раз, сколько нужно, чтобы выйти из critical.
    let stabilizations = 0
    while (computeRisk(get()).level === 'critical') {
      expect(checkAction(get(), 'stabilize').allowed).toBe(true)
      state = applyAction(state, id, 'stabilize')
      stabilizations += 1
      expect(stabilizations).toBeLessThanOrEqual(12)
    }
    expect(computeRisk(get()).level).not.toBe('critical')

    // 3. Отправка спасателя (запрещена в critical — потому шаг 2 обязателен).
    expect(checkAction(get(), 'sendRescuer').allowed).toBe(true)
    state = applyAction(state, id, 'sendRescuer')
    expect(get().rescuerSent).toBe(true)

    // 4. Эвакуация.
    expect(checkAction(get(), 'evacuate').allowed).toBe(true)
    state = applyAction(state, id, 'evacuate')
    expect(get().creaturesInside).toBe(0)

    // 5. Закрытие (наблюдатель ещё внутри → allowed с подтверждением).
    expect(checkAction(get(), 'close').allowed).toBe(true)
    state = applyAction(state, id, 'close')
    expect(get().status).toBe('closed')
  })
})
