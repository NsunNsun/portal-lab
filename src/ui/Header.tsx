import { Tabs } from './Tabs'
import type { TabKey } from './Tabs'
import type { ShiftKind } from '../domain/types'
import { MAX_OPEN_PORTALS } from '../domain/reducer'

/**
 * App header: title on the left; on the right the section tabs (moved up from
 * their own row) over a controls row — start a shift, advance the hour, and the
 * open-portal counter.
 */
export function Header({
  tab,
  onTabChange,
  openCount,
  onAdvanceHour,
  onStartShift,
}: {
  tab: TabKey
  onTabChange: (key: TabKey) => void
  openCount: number
  onAdvanceHour: () => void
  onStartShift: (kind: ShiftKind) => void
}) {
  return (
    <header
      className="flex flex-col gap-4 border-b py-4 md:flex-row md:items-start md:justify-between"
      style={{ borderColor: 'var(--line)' }}
    >
      <div>
        <h1 className="text-lg font-semibold leading-tight">
          Лаборатория нестабильных порталов
        </h1>
        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
          Панель смотрителя
        </p>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--ink-muted)' }}>
          Следите за риском порталов и решайте, что с ними делать.
        </p>
      </div>

      {/* Tabs on top, controls beneath; both right-aligned on md+. */}
      <div className="flex flex-col gap-3 md:items-end">
        <Tabs value={tab} onChange={onTabChange} />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onStartShift('new')} className="control">
            Новая смена
          </button>
          <button type="button" onClick={() => onStartShift('empty')} className="control">
            Пустая смена
          </button>
          <button type="button" onClick={onAdvanceHour} className="control">
            ⏱ Прошёл час
          </button>
          <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>
            Открыто {openCount} из {MAX_OPEN_PORTALS}
          </span>
        </div>
      </div>
    </header>
  )
}
