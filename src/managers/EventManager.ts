import type { DomainEvent, EventName } from '../types'

export class EventManager {
  private events: DomainEvent[] = []

  emit(name: EventName, payload: Record<string, unknown>) {
    this.events.push({ name, at: new Date(), payload })
  }

  all(): ReadonlyArray<DomainEvent> { return this.events }
  clear() { this.events = [] }
}
