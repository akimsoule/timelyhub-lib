import { describe, it, expect } from 'vitest'
import { NotificationManager } from '../src/managers/NotificationManager'
import type { DomainEvent, WebhookSubscription, SlackSubscription } from '../src/types'

describe('NotificationManager fan-out', () => {
  it('enqueues notifications for webhooks and slack subs', () => {
    const nm = new NotificationManager()
    const wh: WebhookSubscription = { id: 'wh1', url: 'https://example.test/hook', events: ['entry.added'] }
    const sl: SlackSubscription = { id: 'sl1', channel: '#times', events: [] } // empty => all
    nm.subscribeWebhook(wh)
    nm.subscribeSlack(sl)

    const ev: DomainEvent = { name: 'entry.added', at: new Date(), payload: { id: 't' } }
    nm.dispatch(ev)

    const out = nm.listOutbox()
    expect(out.some(o => o.channel==='webhook')).toBe(true)
    expect(out.some(o => o.channel==='slack')).toBe(true)
  })
})
