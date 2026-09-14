import type { ActionType, Portal } from '../domain/types'
import { computeRisk } from '../domain/risk'
import { recommendAction } from '../domain/recommend'
import { RISK_META, formatTime } from './visuals'
import { Meter } from './Meter'
import { RiskBreakdownPanel } from './RiskBreakdownPanel'
import { ActionButtons } from './ActionButtons'

/**
 * Portal detail sections (risk score, breakdown, recommendation, parameters,
 * actions, history). Shared by the desktop side card and the mobile accordion.
 */
export function PortalDetails({
  portal,
  onAction,
}: {
  portal: Portal
  onAction: (action: ActionType) => void
}) {
  const risk = computeRisk(portal)
  const rec = recommendAction(portal)
  const meta = RISK_META[risk.level]

  return (
    <div className="flex flex-col gap-4">
      {/* Risk score */}
      <div className="flex items-end gap-3">
        <span style={{ fontSize: 40, lineHeight: 1, color: meta.color }} className="font-semibold">
          {risk.score}
        </span>
        <span className="mb-1 inline-flex items-center gap-1.5" style={{ color: meta.color }}>
          <span aria-hidden>{meta.icon}</span>
          <span className="font-medium">{meta.word}</span>
        </span>
      </div>

      {/* How the risk is computed */}
      <RiskBreakdownPanel risk={risk} />

      {/* Recommendation */}
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

      {/* Parameters */}
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
            style={{ color: portal.hoursToCollapse <= 2 ? 'var(--risk-critical)' : 'var(--ink)' }}
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

      {/* Actions */}
      <ActionButtons portal={portal} onAction={onAction} />

      {/* History */}
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
