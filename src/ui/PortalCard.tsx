import type { ActionType, Portal } from '../domain/types'
import { computeRisk } from '../domain/risk'
import { recommendAction } from '../domain/recommend'
import { RISK_META, formatTime } from './visuals'
import { StatusBadge } from './StatusBadge'
import { Meter } from './Meter'
import { RiskBreakdownPanel } from './RiskBreakdownPanel'
import { ActionButtons } from './ActionButtons'

/** Detail card for the selected portal. Placeholder when nothing is selected. */
export function PortalCard({
  portal,
  onAction,
}: {
  portal: Portal | null
  onAction: (action: ActionType) => void
}) {
  if (!portal) {
    return (
      <div
        className="grid min-h-40 place-items-center rounded-lg p-6 text-sm"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--ring)',
          color: 'var(--ink-muted)',
        }}
      >
        Выберите портал в таблице
      </div>
    )
  }

  const risk = computeRisk(portal)
  const rec = recommendAction(portal)
  const meta = RISK_META[risk.level]

  return (
    <div
      className="flex flex-col gap-4 rounded-lg p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
    >
      {/* 1. Title / world / status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold leading-tight">{portal.name}</h2>
          <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            мир {portal.world}
          </p>
        </div>
        <StatusBadge status={portal.status} />
      </div>

      {/* 2. Risk score */}
      <div className="flex items-end gap-3">
        <span style={{ fontSize: 40, lineHeight: 1, color: meta.color }} className="font-semibold">
          {risk.score}
        </span>
        <span className="mb-1 inline-flex items-center gap-1.5" style={{ color: meta.color }}>
          <span aria-hidden>{meta.icon}</span>
          <span className="font-medium">{meta.word}</span>
        </span>
      </div>

      {/* 3. How the risk is computed */}
      <RiskBreakdownPanel risk={risk} />

      {/* 4. Recommendation */}
      <div className="rounded-md p-3" style={{ border: '1px solid var(--line)' }}>
        <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          Рекомендуем
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-sm">{rec.text}</span>
          {rec.action && (
            <button
              type="button"
              onClick={() => onAction(rec.action!)}
              className="shrink-0 rounded-md px-3 py-1 text-sm font-medium"
              style={{ background: 'var(--accent)', color: 'var(--ink)' }}
            >
              Выполнить
            </button>
          )}
        </div>
      </div>

      {/* 5. Parameters */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Param label="Энергия">
          <Meter value={portal.energy} label="Энергия" />
        </Param>
        <Param label="Стабильность">
          <Meter value={portal.stability} label="Стабильность" />
        </Param>
        <Param label="До схлопывания">
          <span
            className="nums"
            style={{
              color: portal.hoursToCollapse <= 2 ? 'var(--risk-critical)' : 'var(--ink)',
            }}
          >
            {portal.hoursToCollapse} ч
          </span>
        </Param>
        <Param label="Существ внутри">
          <span className="nums">{portal.creaturesInside}</span>
        </Param>
        <Param label="Наблюдатель">
          <span>{portal.observerSent ? 'да' : 'нет'}</span>
        </Param>
      </div>

      {/* 6. Actions */}
      <ActionButtons portal={portal} onAction={onAction} />

      {/* 7. History */}
      <div>
        <div className="mb-2 text-xs" style={{ color: 'var(--ink-muted)' }}>
          История изменений
        </div>
        {portal.history.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
            Изменений пока не было.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {portal.history.map((h) => (
              <li key={h.id} className="flex gap-2 text-sm">
                <span className="nums shrink-0" style={{ color: 'var(--ink-muted)' }}>
                  {formatTime(h.at)}
                </span>
                <span style={{ color: 'var(--ink-2)' }}>{h.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Param({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}
