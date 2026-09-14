export type ToastKind = 'success' | 'blocked' | 'system'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

/** Border/text color per toast kind. */
export const TOAST_COLOR: Record<ToastKind, string> = {
  success: 'var(--accent)',
  blocked: 'var(--risk-critical)',
  system: 'var(--ink-muted)',
}
