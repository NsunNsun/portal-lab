import { describe, it, expect } from 'vitest'
import { SEED, nextRandom, randomInt } from '../domain/random'

describe('random (mulberry32)', () => {
  it('одно и то же состояние даёт один и тот же результат', () => {
    expect(nextRandom(SEED)).toEqual(nextRandom(SEED))
  })

  it('порождает воспроизводимую последовательность', () => {
    const seq = (n: number) => {
      let s = SEED
      const out: number[] = []
      for (let i = 0; i < n; i++) {
        const r = nextRandom(s)
        out.push(r.value)
        s = r.next
      }
      return out
    }
    expect(seq(20)).toEqual(seq(20))
  })

  it('значения лежат в [0, 1)', () => {
    let s = SEED
    for (let i = 0; i < 200; i++) {
      const r = nextRandom(s)
      expect(r.value).toBeGreaterThanOrEqual(0)
      expect(r.value).toBeLessThan(1)
      s = r.next
    }
  })

  it('randomInt возвращает целое в диапазоне включительно', () => {
    let s = SEED
    const seen = new Set<number>()
    for (let i = 0; i < 300; i++) {
      const r = randomInt(s, 3, 7)
      expect(Number.isInteger(r.value)).toBe(true)
      expect(r.value).toBeGreaterThanOrEqual(3)
      expect(r.value).toBeLessThanOrEqual(7)
      seen.add(r.value)
      s = r.next
    }
    // за 300 бросков должны встретиться и края диапазона
    expect(seen.has(3)).toBe(true)
    expect(seen.has(7)).toBe(true)
  })
})
