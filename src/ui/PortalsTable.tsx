import type { ActionType, Portal, RiskBreakdown } from '../domain/types'
import { computeRisk } from '../domain/risk'
import { sortPortals } from '../domain/sort'
import { Meter } from './Meter'
import { StatusBadge } from './StatusBadge'
import { RiskBadge } from './RiskBadge'
import { PeopleBadges } from './PeopleBadges'
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

/** Fixed column widths so the table never overflows its container. */
const COLS = [
  { key: 'name', label: 'Название', width: '15%' },
  { key: 'energy', label: 'Энергия', width: '13%' },
  { key: 'stability', label: 'Стабильность', width: '13%' },
  { key: 'collapse', label: 'До схлопывания, ч', width: '15%' },
  { key: 'creatures', label: 'Существа', width: '9%' },
  { key: 'status', label: 'Статус', width: '13%' },
  { key: 'risk', label: 'Риск', width: '22%' },
] as const

/** Muted em dash for unknown (unsurveyed) parameters. */
function Dash() {
  return <span style={{ color: 'var(--ink-muted)' }}>—</span>
}

/** A portal counts as «new» during the hour it appeared. */
function isNew(portal: Portal, hoursElapsed: number): boolean {
  return hoursElapsed - portal.spawnedAtHour < 1
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
            isNew={isNew(row.portal, hoursElapsed)}
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
              <th key={c.key} className="whitespace-nowrap px-2 py-2 text-xs font-normal">
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
                className="cursor-pointer border-t"
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
                    {isNew(portal, hoursElapsed) && <NewBadge />}
                    <PeopleBadges portal={portal} />
                  </div>
                  <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {portal.world}
                  </div>
                </Td>
                <Td>{known ? <Meter value={portal.energy} label="Энергия" /> : <Dash />}</Td>
                <Td>{known ? <Meter value={portal.stability} label="Стабильность" /> : <Dash />}</Td>
                <Td>
                  <span
                    className="nums"
                    style={{
                      color: portal.hoursToCollapse <= 2 ? 'var(--risk-critical)' : 'var(--ink)',
                    }}
                  >
                    {portal.hoursToCollapse}
                  </span>
                </Td>
                <Td className="nums">{known ? portal.creaturesInside : <Dash />}</Td>
                <Td>
                  <StatusBadge status={portal.status} />
                </Td>
                <Td className="whitespace-nowrap">
                  <RiskBadge level={risk.level} score={risk.score} />
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
              <PeopleBadges portal={portal} />
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
          <LabeledField label="Существа">
            {known ? <span className="nums">{portal.creaturesInside}</span> : <Dash />}
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
