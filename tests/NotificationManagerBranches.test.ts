import { describe, it, expect } from 'vitest'
import { NotificationManager } from '../src/managers/NotificationManager'
import type { DomainEvent, WebhookSubscription } from '../src/types'

describe('NotificationManager branches', () => {
  it('skips subscriptions when event not matched and supports clearOutbox', () => {
    const nm = new NotificationManager()
    const whNo: WebhookSubscription = { id: 'wh-no', url: 'https://x/y', events: ['other.event'] }
    nm.subscribeWebhook(whNo)

    const ev: DomainEvent = { name: 'entry.added', at: new Date(), payload: {} }
    nm.dispatch(ev)

    expect(nm.listOutbox().length).toBe(0)
    nm.clearOutbox()
    expect(nm.listOutbox().length).toBe(0)
  })
})
