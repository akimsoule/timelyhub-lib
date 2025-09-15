import type { EmailMessage, EmailTemplate } from '../types'

export class EmailManager {
  private outbox: EmailMessage[] = []
  private templates: Map<string, EmailTemplate> = new Map()

  addTemplate(t: EmailTemplate) { this.templates.set(t.name, t) }
  getTemplate(name: EmailTemplate['name']): EmailTemplate | undefined { return this.templates.get(name) }
  listTemplates(): ReadonlyArray<EmailTemplate> { return Array.from(this.templates.values()) }

  send(msg: EmailMessage) { this.outbox.push(msg) }
  all(): ReadonlyArray<EmailMessage> { return this.outbox }
  clear() { this.outbox = [] }

  // util: rendu trivial {{key}}
  render(name: EmailTemplate['name'], vars: Record<string, string>): { subject: string; body: string } {
    const t = this.templates.get(name)
    if (!t) throw new Error(`Template not found: ${name}`)
    const fill = (s: string) => s.replace(/\{\{(.*?)\}\}/g, (_, k) => vars[k.trim()] ?? '')
    return { subject: fill(t.subject), body: fill(t.body) }
  }
}
