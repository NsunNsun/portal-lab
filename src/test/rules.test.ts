import { describe, it, expect } from 'vitest'
import { checkAction } from '../domain/rules'
import { makePortal } from './helpers'

describe('checkAction', () => {
  it('нельзя стабилизировать неразведанный портал', () => {
    const res = checkAction(makePortal({ surveyed: false }), 'stabilize')
    expect(res.allowed).toBe(false)
    if (!res.allowed) {
      expect(res.reason).toBe('Параметры портала неизвестны. Сначала отправьте наблюдателя.')
    }
  })

  it('нельзя отправить спасателя в неразведанный портал', () => {
    const res = checkAction(makePortal({ surveyed: false, creaturesInside: 2 }), 'sendRescuer')
    expect(res.allowed).toBe(false)
    if (!res.allowed) {
      expect(res.reason).toBe('Портал не разведан: неизвестно, есть ли внутри кого спасать.')
    }
  })

  it('нельзя отправить спасателя в критический портал', () => {
    const critical = makePortal({ stability: 8, energy: 90, hoursToCollapse: 18, creaturesInside: 2 })
    const res = checkAction(critical, 'sendRescuer')
    expect(res.allowed).toBe(false)
    if (!res.allowed) {
      expect(res.reason).toContain('Отправлять спасателя запрещено регламентом.')
    }
  })

  it('нельзя эвакуировать, если спасателя внутри нет', () => {
    const res = checkAction(
      makePortal({ creaturesInside: 2, rescuerSent: false, stability: 60, energy: 40 }),
      'evacuate',
    )
    expect(res.allowed).toBe(false)
    if (!res.allowed) {
      expect(res.reason).toBe('Внутри нет спасателя. Сначала отправьте спасателя.')
    }
  })

  it('нельзя эвакуировать, если существ нет', () => {
    const res = checkAction(makePortal({ creaturesInside: 0, rescuerSent: true }), 'evacuate')
    expect(res.allowed).toBe(false)
    if (!res.allowed) {
      expect(res.reason).toBe('Внутри нет существ — эвакуировать некого.')
    }
  })

  it('наблюдателя в неразведанный портал отправить МОЖНО (разведка вслепую)', () => {
    const res = checkAction(makePortal({ surveyed: false, stability: 5, energy: 100 }), 'sendObserver')
    expect(res.allowed).toBe(true)
  })

  it('закрытие неразведанного портала требует подтверждения', () => {
    const res = checkAction(makePortal({ surveyed: false }), 'close')
    expect(res.allowed).toBe(true)
    if (res.allowed && 'confirm' in res) {
      expect(res.confirm).toBe('Портал не разведан: неизвестно, есть ли внутри живые. Закрыть вслепую?')
    } else {
      throw new Error('ожидалось подтверждение')
    }
  })
})
