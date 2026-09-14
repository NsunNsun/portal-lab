import { useState } from 'react'
import type { RiskBreakdown } from '../domain/types'
import { formatNum, formatShare, formatSigned } from './visuals'

/**
 * Collapsible «Как посчитан риск». First the three weighted base indicators,
 * then the sequence of factors — each pulling risk a share of the way to 100.
 * Non-applied factors are shown muted with a note. All numbers come from the
 * breakdown the risk function returns; nothing is recomputed here.
 */
export function RiskBreakdownPanel({ risk }: { risk: RiskBreakdown }) {
  const [open, setOpen] = useState(false)

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
              {/* Base: three weighted indicators */}
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
                className="mt-2 flex justify-between border-t pt-2 text-xs font-medium"
                style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}
              >
                <span>База</span>
                <span className="nums">{formatNum(risk.base)}</span>
              </div>

              {/* Sequential factors */}
              <div className="mt-3 text-xs" style={{ color: 'var(--ink-muted)' }}>
                Факторы применяются по порядку — каждый приближает риск к 100
              </div>
              <ul className="mt-2 flex flex-col gap-2">
                {risk.steps.map((s, i) => (
                  <li
                    key={`${s.label}-${i}`}
                    className="flex flex-col gap-0.5"
                    style={{ opacity: s.applied ? 1 : 0.55 }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden style={{ color: s.applied ? 'var(--risk-high)' : 'var(--ink-muted)' }}>
                          {s.applied ? '●' : '○'}
                        </span>
                        <span>{s.label}</span>
                      </span>
                      {s.applied ? (
                        <span className="nums shrink-0" style={{ color: 'var(--ink-2)' }}>
                          доля {formatShare(s.share)} · {formatNum(s.before)} → {formatNum(s.after)}{' '}
                          <span style={{ color: 'var(--risk-high)' }}>({formatSigned(s.delta)})</span>
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs" style={{ color: 'var(--ink-muted)' }}>
                          не сработал
                        </span>
                      )}
                    </div>
                    <div className="pl-5 text-xs" style={{ color: 'var(--ink-muted)' }}>
                      {s.note}
                    </div>
                  </li>
                ))}
              </ul>

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
