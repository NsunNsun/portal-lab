import type { RiskLevel } from '../domain/types'
import { RISK_META } from './visuals'

/**
 * Risk shown as icon + word + number, colored by level.
 * Never a bare colored dot — color alone must not carry the meaning.
 */
export function RiskBadge({
  level,
  score,
  size = 'sm',
}: {
  level: RiskLevel
  score: number
  size?: 'sm' | 'lg'
}) {
  const meta = RISK_META[level]
  const large = size === 'lg'

  // Unsurveyed portal: no number to show — just «? Нет данных», muted.
  if (level === 'unknown') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 ${large ? 'text-base' : 'text-sm'}`}
        style={{ color: meta.color }}
      >
        <span aria-hidden>{meta.icon}</span>
        <span>{meta.word}</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${large ? 'text-base' : 'text-sm'}`}
      style={{ color: meta.color }}
    >
      <span aria-hidden>{meta.icon}</span>
      <span className="font-medium">{meta.word}</span>
      <span className="opacity-70">·</span>
      <span className="nums font-semibold">{score}</span>
    </span>
  )
}
