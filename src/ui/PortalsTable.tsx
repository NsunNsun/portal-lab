import type { Portal, RiskBreakdown } from '../domain/types'
import { computeRisk } from '../domain/risk'
import { useMediaQuery } from './useMediaQuery'
import { Meter } from './Meter'
import { StatusBadge } from './StatusBadge'
import { RiskBadge } from './RiskBadge'

interface Row {
  portal: Portal
  risk: RiskBreakdown
}

/** Sort portals by risk descending — always, no interactive sorting. */
function toSortedRows(portals: Portal[]): Row[] {
  return portals
    .map((portal) => ({ portal, risk: computeRisk(portal) }))
    .sort((a, b) => b.risk.score - a.risk.score)
}

function collapseText(hours: number): { text: string; danger: boolean } {
  return { text: `${hours} ч`, danger: hours <= 2 }
}

export function PortalsTable({
  portals,
  selectedId,
  onSelect,
}: {
  portals: Portal[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const compact = useMediaQuery('(max-width: 899px)')
  const rows = toSortedRows(portals)

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <PortalRowCard
            key={row.portal.id}
            row={row}
            selected={row.portal.id === selectedId}
            onSelect={onSelect}
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
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ color: 'var(--ink-muted)' }} className="text-left">
            <Th>Название</Th>
            <Th>Мир</Th>
            <Th className="w-36">Энергия</Th>
            <Th className="w-36">Стабильность</Th>
            <Th>До схлопывания</Th>
            <Th>Существа</Th>
            <Th>Статус</Th>
            <Th>Риск</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ portal, risk }) => {
            const selected = portal.id === selectedId
            const closed = portal.status === 'closed'
            const collapse = collapseText(portal.hoursToCollapse)
            return (
              <tr
                key={portal.id}
                onClick={() => onSelect(portal.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(portal.id)
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
                <Td className="font-medium">{portal.name}</Td>
                <Td style={{ color: 'var(--ink-2)' }}>{portal.world}</Td>
                <Td>
                  <Meter value={portal.energy} label="Энергия" />
                </Td>
                <Td>
                  <Meter value={portal.stability} label="Стабильность" />
                </Td>
                <Td>
                  <span
                    className="nums"
                    style={{ color: collapse.danger ? 'var(--risk-critical)' : 'var(--ink)' }}
                  >
                    {collapse.text}
                  </span>
                </Td>
                <Td className="nums">{portal.creaturesInside}</Td>
                <Td>
                  <StatusBadge status={portal.status} />
                </Td>
                <Td>
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

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 font-normal ${className}`}>{children}</th>
}

function Td({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <td className={`px-3 py-2 align-middle ${className}`} style={style}>
      {children}
    </td>
  )
}

/** Compact row rendered as a card below 900px. */
function PortalRowCard({
  row,
  selected,
  onSelect,
}: {
  row: Row
  selected: boolean
  onSelect: (id: string) => void
}) {
  const { portal, risk } = row
  const closed = portal.status === 'closed'
  const collapse = collapseText(portal.hoursToCollapse)
  return (
    <button
      type="button"
      onClick={() => onSelect(portal.id)}
      className="w-full rounded-lg p-3 text-left"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--ring)',
        boxShadow: selected ? 'inset 3px 0 0 0 var(--accent)' : 'none',
        opacity: closed ? 0.55 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{portal.name}</div>
          <div className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            {portal.world}
          </div>
        </div>
        <RiskBadge level={risk.level} score={risk.score} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <LabeledMeter label="Энергия" value={portal.energy} />
        <LabeledMeter label="Стабильность" value={portal.stability} />
        <Field label="До схлопывания">
          <span
            className="nums"
            style={{ color: collapse.danger ? 'var(--risk-critical)' : 'var(--ink)' }}
          >
            {collapse.text}
          </span>
        </Field>
        <Field label="Существа">
          <span className="nums">{portal.creaturesInside}</span>
        </Field>
      </div>
      <div className="mt-3">
        <StatusBadge status={portal.status} />
      </div>
    </button>
  )
}

function LabeledMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </div>
      <Meter value={value} label={label} />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs" style={{ color: 'var(--ink-muted)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}
