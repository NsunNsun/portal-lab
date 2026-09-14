import { useState } from 'react'
import type { LogEntry } from '../domain/types'
import { LOG_KIND_META, formatTime } from './visuals'

type Filter = 'all' | 'action' | 'blocked' | 'system'

const CHIPS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'action', label: 'Действия' },
  { key: 'blocked', label: 'Отказы' },
  { key: 'system', label: 'Система' },
]

/** «Журнал событий» tab: filterable list, newest first. */
export function EventLog({ log }: { log: LogEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const entries = filter === 'all' ? log : log.filter((e) => e.kind === filter)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const active = chip.key === filter
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className="rounded-full px-3 py-1 text-sm"
              style={{
                border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                color: active ? 'var(--ink)' : 'var(--ink-2)',
                background: active ? 'rgba(57,135,229,0.12)' : 'transparent',
              }}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
        Журнал ведётся в рамках текущего набора данных и очищается при его смене.
      </p>

      {entries.length === 0 ? (
        <p className="py-10 text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
          Событий пока нет. Выполните действие над порталом.
        </p>
      ) : (
        <ul
          className="divide-y rounded-lg"
          style={{ background: 'var(--surface)', border: '1px solid var(--ring)' }}
        >
          {entries.map((entry) => (
            <LogRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  )
}

function LogRow({ entry }: { entry: LogEntry }) {
  const meta = LOG_KIND_META[entry.kind]
  return (
    <li className="flex items-start gap-3 px-3 py-2 text-sm" style={{ borderColor: 'var(--line)' }}>
      <span
        className="inline-flex shrink-0 items-center gap-1"
        style={{ color: meta.color, minWidth: '5.5rem' }}
      >
        <span aria-hidden>{meta.icon}</span>
        <span>{meta.word}</span>
      </span>
      <span className="nums shrink-0" style={{ color: 'var(--ink-muted)' }}>
        {formatTime(entry.at)}
      </span>
      <span className="flex-1" style={{ color: 'var(--ink-2)' }}>
        {entry.portalName && (
          <span style={{ color: 'var(--ink)' }}>{entry.portalName}: </span>
        )}
        {entry.message}
      </span>
    </li>
  )
}
