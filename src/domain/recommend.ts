import type { Portal, Recommendation } from './types'
import { computeRisk } from './risk'

/**
 * Suggest the single most sensible next action for a portal.
 * The suggestion is advisory — the reducer still enforces the rules.
 */
export function recommendAction(portal: Portal): Recommendation {
  if (portal.status === 'closed') {
    return { text: 'Действий не требуется', action: null }
  }

  const { level } = computeRisk(portal)

  if (level === 'critical') {
    if (portal.creaturesInside > 0) {
      return { text: 'Эвакуировать существ и закрыть портал', action: 'close' }
    }
    return { text: 'Немедленно закрыть портал', action: 'close' }
  }

  if (level === 'high') {
    return { text: 'Стабилизировать портал', action: 'stabilize' }
  }

  if (level === 'medium') {
    if (!portal.observerSent) {
      return { text: 'Отправить наблюдателя', action: 'sendObserver' }
    }
    return { text: 'Продолжать наблюдение', action: null }
  }

  return { text: 'Оставить открытым', action: null }
}
