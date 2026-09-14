import { describe, it, expect } from 'vitest'
import { checkAction } from '../domain/rules'
import { makePortal } from './helpers'

describe('checkAction', () => {
  it('нельзя стабилизировать закрытый портал', () => {
    const res = checkAction(makePortal({ status: 'closed' }), 'stabilize')
    expect(res.allowed).toBe(false)
    if (!res.allowed) expect(res.reason).toBe('Портал закрыт — стабилизировать нечего.')
  })

  it('нельзя отправить наблюдателя в критический портал', () => {
    const res = checkAction(makePortal({ stability: 5, energy: 90 }), 'sendObserver')
    expect(res.allowed).toBe(false)
    if (!res.allowed) expect(res.reason).toContain('Отправлять наблюдателя запрещено регламентом.')
  })

  it('нельзя отправить второго наблюдателя', () => {
    const res = checkAction(
      makePortal({ observerSent: true, stability: 70, energy: 30, hoursToCollapse: 40 }),
      'sendObserver',
    )
    expect(res.allowed).toBe(false)
    if (!res.allowed) expect(res.reason).toBe('Наблюдатель уже находится внутри.')
  })

  it('закрытие портала с существами требует подтверждения', () => {
    const res = checkAction(makePortal({ creaturesInside: 3 }), 'close')
    expect(res.allowed).toBe(true)
    if (res.allowed && 'confirm' in res) {
      expect(res.confirm).toContain('Внутри портала существ: 3')
    } else {
      throw new Error('ожидалось подтверждение')
    }
  })
})
