import type { ActionType, Portal, RiskBreakdown, RiskLevel } from '../domain/types'
import { computeRisk } from '../domain/risk'
import { sortPortals } from '../domain/sort'
import { isNewPortal } from '../domain/portal'
import { Meter } from './Meter'
import { StatusBadge } from './StatusBadge'
import { RiskBadge } from './RiskBadge'
import { RISK_META } from './visuals'
import { PeopleInside } from './PeopleBadges'
import { NewBadge } from './PeopleBadges'
import { PortalDetails } from './PortalDetails'

interface Row {
  portal: Portal
  risk: RiskBreakdown
}

/** Sort via the domain comparator, then attach each portal's risk breakdown. */
function toSortedRows(portals: Portal[]): Row[] {
  return sortPortals(portals).map((portal) => ({ portal, risk: computeRisk(portal) }))
}

/**
 * Fixed column widths so the table never overflows its container. The page cap
 * was raised max-w-6xl→max-w-7xl (1152→1280px), so the wide layout now gives the
 * table ~830px (page inner minus the 400px detail column and the grid gap)
 * instead of ~704px — the extra ~128px is what makes all seven one-line labels
 * fit comfortably rather than by pixel-shaving one column against another. Every
 * header label fits on one line: «Название» holds the longest spawn name
 * («Хрустальная Трещина»), «Статус» holds the «Под вопросом» badge, «Осталось, ч»
 * stays on one line, and «Риск» (two lines) fits «Критический». «Внутри» is wide
 * enough for «наблюдатель» on one line, so «наблюдатель, спасатель» wraps by word.
 * Cell padding is back to px-2 (shrunk to px-1.5 only when space was tight).
 * `center` columns align both header and cells to the middle.
 */
const COLS = [
  { key: 'name', label: 'Название', width: '23%', center: false },
  { key: 'energy', label: 'Энергия', width: '11%', center: true },
  { key: 'stability', label: 'Стабильность', width: '13%', center: true },
  { key: 'collapse', label: 'Осталось, ч', width: '11%', center: true },
  { key: 'creatures', label: 'Внутри', width: '13%', center: true },
  { key: 'status', label: 'Статус', width: '15%', center: true },
  { key: 'risk', label: 'Риск', width: '14%', center: false },
] as const

/** Muted em dash for unknown (unsurveyed) parameters. */
function Dash() {
  return <span style={{ color: 'var(--ink-muted)' }}>—</span>
}

export function PortalsTable({
  portals,
  selectedId,
  hoursElapsed,
  onSelect,
  onAction,
  compact,
}: {
  portals: Portal[]
  selectedId: string | null
  hoursElapsed: number
  onSelect: (id: string | null) => void
  onAction: (action: ActionType) => void
  compact: boolean
}) {
  const rows = toSortedRows(portals)

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <PortalAccordionCard
            key={row.portal.id}
            row={row}
            selected={row.portal.id === selectedId}
            isNew={isNewPortal(row.portal, hoursElapsed)}
            onSelect={onSelect}
            onAction={onAction}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
    >
      <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {COLS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ color: 'var(--ink-muted)' }} className="text-left">
            {COLS.map((c) => (
              <th
                key={c.key}
                className={`whitespace-nowrap px-2 py-2 text-xs font-normal ${
                  c.center ? 'text-center' : ''
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ portal, risk }) => {
            const selected = portal.id === selectedId
            const closed = portal.status === 'closed'
            const known = portal.surveyed
            return (
              <tr
                key={portal.id}
                // Re-clicking the selected row clears the selection.
                onClick={() => onSelect(selected ? null : portal.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(selected ? null : portal.id)
                  }
                }}
                // h-14 gives every row the same minimum height so rows with a
                // people line under «Внутри» don't make the table step up and down.
                className="h-14 cursor-pointer border-t"
                style={{
                  borderColor: 'var(--line)',
                  boxShadow: selected ? 'inset 3px 0 0 0 var(--accent)' : 'none',
                  background: selected ? 'rgba(57,135,229,0.08)' : 'transparent',
                  opacity: closed ? 0.55 : 1,
                }}
              >
                <Td>
                  <div className="font-medium leading-tight">
                    {portal.name}
                    {isNewPortal(portal, hoursElapsed) && <NewBadge />}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {portal.world}
                  </div>
                </Td>
                <Td className="text-center">
                  {known ? <Meter value={portal.energy} label="Энергия" layout="inline" /> : <Dash />}
                </Td>
                <Td className="text-center">
                  {known ? (
                    <Meter value={portal.stability} label="Стабильность" layout="inline" />
                  ) : (
                    <Dash />
                  )}
                </Td>
                <Td className="text-center">
                  <span
                    className="nums"
                    style={{
                      color: portal.hoursToCollapse <= 2 ? 'var(--risk-critical)' : 'var(--ink)',
                    }}
                  >
                    {portal.hoursToCollapse}
                  </span>
                </Td>
                <Td className="text-center">
                  {known ? (
                    <>
                      <span className="nums">{portal.creaturesInside}</span>
                      <PeopleInside portal={portal} />
                    </>
                  ) : (
                    <Dash />
                  )}
                </Td>
                <Td className="text-center">
                  <StatusBadge status={portal.status} />
                </Td>
                <Td>
                  <TableRisk level={risk.level} score={risk.score} />
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-2 py-2 align-middle ${className}`}>{children}</td>
}

/**
 * Risk shown on two lines inside the table cell: the level word above, the icon
 * and number below — both in the level color. This keeps the column narrow (the
 * old single line «⚠ Критический · 94» forced a much wider column). Unsurveyed
 * portals show only «Нет данных»; closed portals read «Нет» / «— 0».
 */
function TableRisk({ level, score }: { level: RiskLevel; score: number }) {
  const meta = RISK_META[level]
  return (
    <div className="leading-tight" style={{ color: meta.color }}>
      <div className="font-medium">{meta.word}</div>
      {level !== 'unknown' && (
        <div className="mt-0.5 whitespace-nowrap">
          <span aria-hidden>{meta.icon}</span>{' '}
          <span className="nums font-semibold">{score}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact card below 900px. The summary is a toggle button; when selected the
 * full details expand right below it (single card open at a time).
 */
function PortalAccordionCard({
  row,
  selected,
  isNew,
  onSelect,
  onAction,
}: {
  row: Row
  selected: boolean
  isNew: boolean
  onSelect: (id: string | null) => void
  onAction: (action: ActionType) => void
}) {
  const { portal, risk } = row
  const closed = portal.status === 'closed'
  const known = portal.surveyed
  return (
    <div
      className="rounded-lg"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--ring)',
        boxShadow: selected ? 'inset 3px 0 0 0 var(--accent)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(selected ? null : portal.id)}
        aria-expanded={selected}
        className="w-full p-3 text-left"
        style={{ opacity: closed ? 0.55 : 1 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-medium leading-tight">
              {portal.name}
              {isNew && <NewBadge />}
            </div>
            <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
              {portal.world}
            </div>
          </div>
          <RiskBadge level={risk.level} score={risk.score} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <LabeledField label="Энергия">
            {known ? <Meter value={portal.energy} label="Энергия" /> : <Dash />}
          </LabeledField>
          <LabeledField label="Стабильность">
            {known ? <Meter value={portal.stability} label="Стабильность" /> : <Dash />}
          </LabeledField>
          <LabeledField label="До схлопывания">
            <span
              className="nums"
              style={{
                color: portal.hoursToCollapse <= 2 ? 'var(--risk-critical)' : 'var(--ink)',
              }}
            >
              {portal.hoursToCollapse} ч
            </span>
          </LabeledField>
          <LabeledField label="Внутри">
            {known ? (
              <>
                <span className="nums">{portal.creaturesInside}</span>
                <PeopleInside portal={portal} />
              </>
            ) : (
              <Dash />
            )}
          </LabeledField>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <StatusBadge status={portal.status} />
          <span className="text-xs" style={{ color: 'var(--ink-muted)' }} aria-hidden>
            {selected ? 'Свернуть ▲' : 'Подробнее ▼'}
          </span>
        </div>
      </button>

      {selected && (
        <div className="border-t px-3 pb-3 pt-3" style={{ borderColor: 'var(--line)' }}>
          <PortalDetails portal={portal} onAction={onAction} />
        </div>
      )}
    </div>
  )
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}
