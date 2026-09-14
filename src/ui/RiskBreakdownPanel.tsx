import { useState } from 'react'
import type { RiskBreakdown } from '../domain/types'
import { MODIFIER_EFFECT, formatNum } from './visuals'

/**
 * Collapsible «Как посчитан риск». All numbers come from the breakdown the
 * risk function returns — nothing is recomputed here.
 */
export function RiskBreakdownPanel({ risk }: { risk: RiskBreakdown }) {
  const [open, setOpen] = useState(false)

  const base = risk.parts.reduce((sum, p) => sum + p.contribution, 0)

  return (
    <div className="rounded-md" style={{ border: '1px solid var(--line)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2 text-sm"
        style={{ color: 'var(--ink-2)' }}
      >
        <span>Как посчитан риск</span>
        <span aria-hidden>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 text-sm">
          {risk.parts.length === 0 ? (
            <p style={{ color: 'var(--ink-muted)' }}>
              Портал закрыт — риск не рассчитывается.
            </p>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ color: 'var(--ink-muted)' }} className="text-left text-xs">
                    <th className="py-1 font-normal">Показатель</th>
                    <th className="py-1 text-right font-normal">Значение</th>
                    <th className="py-1 text-right font-normal">Вес</th>
                    <th className="py-1 text-right font-normal">Вклад</th>
                  </tr>
                </thead>
                <tbody>
                  {risk.parts.map((p) => (
                    <tr key={p.label} className="border-t" style={{ borderColor: 'var(--line)' }}>
                      <td className="py-1">{p.label}</td>
                      <td className="nums py-1 text-right">{formatNum(p.raw)}</td>
                      <td className="nums py-1 text-right" style={{ color: 'var(--ink-muted)' }}>
                        {formatNum(p.weight)}
                      </td>
                      <td className="nums py-1 text-right">{formatNum(p.contribution)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                className="mt-2 flex justify-between border-t pt-2 text-xs"
                style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}
              >
                <span>База</span>
                <span className="nums">{formatNum(base)}</span>
              </div>

              <div className="mt-3 space-y-1">
                <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                  Модификаторы
                </div>
                {risk.modifiers.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-start gap-2 text-xs"
                    style={{ color: m.applied ? 'var(--risk-high)' : 'var(--ink-muted)' }}
                  >
                    <span aria-hidden>{m.applied ? '●' : '○'}</span>
                    <span>{MODIFIER_EFFECT[m.label] ?? m.label}</span>
                  </div>
                ))}
              </div>

              <div
                className="mt-3 flex justify-between border-t pt-2 font-medium"
                style={{ borderColor: 'var(--line)' }}
              >
                <span>Итог</span>
                <span className="nums">{risk.score}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
