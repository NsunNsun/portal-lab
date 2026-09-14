import type { Portal, Recommendation } from './types'
import { computeRisk } from './risk'

/**
 * Suggest the single most sensible next action for a portal.
 * The suggestion is advisory — the reducer still enforces the rules.
 *
 * The chain is tuned to walk the full lifecycle in order: survey an unknown
 * portal, calm it down, rescue and evacuate its creatures, then close it.
 */
export function recommendAction(portal: Portal): Recommendation {
  if (portal.status === 'closed') {
    return { text: 'Действий не требуется', action: null }
  }

  // An unsurveyed portal has no known risk — the only sensible move is to look.
  if (!portal.surveyed) {
    return { text: 'Отправить наблюдателя для разведки', action: 'sendObserver' }
  }

  const { level } = computeRisk(portal)

  // Creatures inside: reduce risk, rescue, then evacuate.
  if (portal.creaturesInside > 0) {
    if (portal.rescuerSent) {
      return { text: 'Эвакуировать существ', action: 'evacuate' }
    }
    if (level === 'critical' || level === 'high') {
      return { text: 'Стабилизировать портал перед спасением', action: 'stabilize' }
    }
    return { text: 'Отправить спасателя за существами', action: 'sendRescuer' }
  }

  // No creatures left inside.
  if (level === 'critical') {
    return { text: 'Немедленно закрыть портал', action: 'close' }
  }
  if (level === 'high') {
    return { text: 'Стабилизировать портал', action: 'stabilize' }
  }

  // Empty of creatures but people are still inside → wrap it up and close.
  if (portal.observerSent || portal.rescuerSent) {
    return { text: 'Существ нет — закрыть портал', action: 'close' }
  }

  if (level === 'medium') {
    return { text: 'Отправить наблюдателя', action: 'sendObserver' }
  }
  return { text: 'Оставить открытым', action: null }
}
