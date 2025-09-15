import { describe, it, expect } from 'vitest'
import { EmailManager } from '../src/managers/EmailManager'
import type { EmailTemplate } from '../src/types'

describe('EmailManager', () => {
  it('send/all/clear works', () => {
    const em = new EmailManager()
    em.send({ id: 'm1', to: ['a@x.com'], subject: 'S', body: 'B' })
    expect(em.all().length).toBe(1)
    em.clear()
    expect(em.all().length).toBe(0)
  })

  it('templates add/get/list and render', () => {
    const em = new EmailManager()
    const t: EmailTemplate = { id: 't1', name: 'entry_submitted', subject: 'Sub {{entryId}}', body: 'Hello {{employee}}' }
    em.addTemplate(t)
    expect(em.getTemplate('entry_submitted')?.id).toBe('t1')
    expect(em.listTemplates().length).toBe(1)
    const r = em.render('entry_submitted', { entryId: 'E1', employee: 'John' })
    expect(r.subject).toBe('Sub E1')
    expect(r.body).toBe('Hello John')
  })

  it('render throws if template missing', () => {
    const em = new EmailManager()
    expect(() => em.render('entry_approved', { entryId: 'E1' })).toThrow('Template not found')
  })

  it('render replaces missing variables with empty string', () => {
    const em = new EmailManager()
    em.addTemplate({ id: 'tX', name: 'entry_submitted', subject: 'Hi {{who}}', body: 'Body {{missing}}' })
    const r = em.render('entry_submitted', { who: 'you' })
    expect(r.subject).toBe('Hi you')
    expect(r.body).toBe('Body ')
  })
})
