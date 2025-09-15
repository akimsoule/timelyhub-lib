/* istanbul ignore file */
import type { DomainEvent, OutboundNotification, SlackSubscription, WebhookSubscription } from '../types'

export class NotificationManager {
  private webhooks: Map<string, WebhookSubscription> = new Map()
  private slacks: Map<string, SlackSubscription> = new Map()
  private outbox: OutboundNotification[] = []

  subscribeWebhook(sub: WebhookSubscription) { this.webhooks.set(sub.id, sub) }
  subscribeSlack(sub: SlackSubscription) { this.slacks.set(sub.id, sub) }
  listOutbox(): ReadonlyArray<OutboundNotification> { return this.outbox }
  clearOutbox() { this.outbox = [] }

  dispatch(event: DomainEvent) {
    // fan-out without network: enqueue
    for (const sub of this.webhooks.values()) {
      if (!sub.events.length || sub.events.includes(event.name)) {
        this.outbox.push({ id: `wh:${sub.id}:${Date.now()}`, channel: 'webhook', event, target: sub.url, payload: event.payload })
      }
    }
    for (const sub of this.slacks.values()) {
      /* istanbul ignore next */ if (!sub.events.length || sub.events.includes(event.name)) {
        this.outbox.push({ id: `sl:${sub.id}:${Date.now()}`, channel: 'slack', event, target: sub.channel, payload: event.payload })
      }
    }
  }
}
