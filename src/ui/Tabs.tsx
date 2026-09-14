export type TabKey = 'portals' | 'log' | 'worklog'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'portals', label: 'Порталы' },
  { key: 'log', label: 'Журнал событий' },
  { key: 'worklog', label: 'AI Worklog' },
]

/** Local-state tab switcher (no router). */
export function Tabs({ value, onChange }: { value: TabKey; onChange: (key: TabKey) => void }) {
  return (
    <nav
      className="flex gap-1 border-b"
      style={{ borderColor: 'var(--line)' }}
      role="tablist"
      aria-label="Разделы"
    >
      {TABS.map((tab) => {
        const active = tab.key === value
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className="-mb-px border-b-2 px-3 py-2 text-sm"
            style={{
              borderColor: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-muted)',
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
