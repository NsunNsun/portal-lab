import type { ActionType, Portal } from '../domain/types'
import { computeRisk } from '../domain/risk'
import { recommendAction } from '../domain/recommend'
import { RISK_META, formatSigned, formatTime } from './visuals'
import { Meter } from './Meter'
import { RiskBreakdownPanel } from './RiskBreakdownPanel'
import { ActionButtons } from './ActionButtons'

/**
 * Portal detail sections. Shared by the desktop side card and the mobile
 * accordion. An unsurveyed portal shows a «Данные недоступны» block in place of
 * the risk score and breakdown; everything else (recommendation, actions,
 * history) still renders.
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
  const known = portal.surveyed

  return (
    <div className="flex flex-col gap-4">
      {/* «Под вопросом» explanation */}
      {portal.status === 'questioned' && (
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          Помечен для разбора. Такие порталы закреплены вверху списка.
        </p>
      )}

      {known ? (
        <>
          {/* Risk score */}
          <RiskHeadline portal={portal} />
          <RiskBreakdownPanel risk={risk} />
        </>
      ) : (
        <UnavailableData onAction={onAction} />
      )}

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
          {known ? <Meter value={portal.energy} label="Энергия" /> : <Unknown />}
        </Param>
        <Param label="Стабильность">
          {known ? <Meter value={portal.stability} label="Стабильность" /> : <Unknown />}
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
          {known ? <span className="nums">{portal.creaturesInside}</span> : <Unknown />}
        </Param>
        <Param label="Наблюдатель">
          <span>{portal.observerSent ? 'да' : 'нет'}</span>
        </Param>
        <Param label="Спасатель">
          <span>{portal.rescuerSent ? 'да' : 'нет'}</span>
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

/** Big risk number, level word, and the dominant-factor line beneath it. */
function RiskHeadline({ portal }: { portal: Portal }) {
  const risk = computeRisk(portal)
  const meta = RISK_META[risk.level]
  return (
    <div>
      <div className="flex items-end gap-3">
        <span style={{ fontSize: 40, lineHeight: 1, color: meta.color }} className="font-semibold">
          {risk.score}
        </span>
        <span className="mb-1 inline-flex items-center gap-1.5" style={{ color: meta.color }}>
          <span aria-hidden>{meta.icon}</span>
          <span className="font-medium">{meta.word}</span>
        </span>
      </div>
      {risk.parts.length > 0 && (
        <p className="mt-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
          {risk.dominant
            ? `Больше всего добавляет: ${risk.dominant.label} (${formatSigned(risk.dominant.delta)})`
            : 'Риск определяется базовыми показателями'}
        </p>
      )}
    </div>
  )
}

/** Shown in place of the risk block for an unsurveyed portal. */
function UnavailableData({ onAction }: { onAction: (action: ActionType) => void }) {
  return (
    <div className="rounded-md p-3" style={{ border: '1px solid var(--line)' }}>
      <h3 className="text-sm font-semibold">Данные недоступны</h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--ink-2)' }}>
        Портал не разведан. Энергия, стабильность и содержимое неизвестны — риск рассчитать нельзя.
      </p>
      <button
        type="button"
        onClick={() => onAction('sendObserver')}
        className="mt-3 rounded-md px-3 py-1.5 text-sm font-medium"
        style={{ background: 'var(--accent)', color: 'var(--ink)' }}
      >
        Отправить наблюдателя
      </button>
    </div>
  )
}

function Unknown() {
  return <span style={{ color: 'var(--ink-muted)' }}>—</span>
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
