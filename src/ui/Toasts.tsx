import { useEffect } from 'react'
import type { Toast } from './toast'
import { TOAST_COLOR } from './toast'

/**
 * Stacked toasts, top-right, auto-dismiss after 4s, closable by ✕.
 * Container is aria-live="polite" so rejections reach screen readers.
 */
export function Toasts({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
}) {
  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,20rem)] flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4000)
    return () => window.clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className="pointer-events-auto flex items-start gap-2 rounded-md px-3 py-2 text-sm shadow-lg"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${TOAST_COLOR[toast.kind]}`,
        color: 'var(--ink)',
      }}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Закрыть уведомление"
        className="shrink-0 opacity-60 hover:opacity-100"
        style={{ color: 'var(--ink-2)' }}
      >
        ✕
      </button>
    </div>
  )
}
