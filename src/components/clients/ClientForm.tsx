'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/Spinner'
import type { Client, CreateClientPayload } from '@/types'

interface Props {
  initial?: Client
}

export function ClientForm({ initial }: Props) {
  const router = useRouter()
  const isEdit = !!initial

  const [form, setForm] = useState<CreateClientPayload>({
    name: initial?.name ?? '',
    whatsapp_group_id: initial?.whatsapp_group_id ?? '',
    clickup_list_id: initial?.clickup_list_id ?? '',
    tone_instructions: initial?.tone_instructions ?? '',
    notify_phone: initial?.notify_phone ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof CreateClientPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = isEdit ? `/api/clients/${initial!.id}` : '/api/clients'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error(await res.text())
      router.push('/clients')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="label">Nome do cliente *</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Ex: Empresa XYZ"
          required
        />
      </div>

      <div>
        <label className="label">ID do grupo WhatsApp *</label>
        <input
          className="input font-mono text-xs"
          value={form.whatsapp_group_id}
          onChange={(e) => set('whatsapp_group_id', e.target.value)}
          placeholder="5511999990001-group@g.us"
          required
        />
        <p className="text-xs text-gray-500 mt-1">JID do grupo retornado pelo Z-API</p>
      </div>

      <div>
        <label className="label">ID da lista ClickUp</label>
        <input
          className="input"
          value={form.clickup_list_id ?? ''}
          onChange={(e) => set('clickup_list_id', e.target.value)}
          placeholder="Opcional"
        />
      </div>

      <div>
        <label className="label">Instruções de tom e estilo</label>
        <textarea
          className="input min-h-[90px] resize-y"
          value={form.tone_instructions ?? ''}
          onChange={(e) => set('tone_instructions', e.target.value)}
          placeholder="Ex: Seja formal, sempre mencione o nome do cliente, use o plural de tratamento..."
        />
      </div>

      <div>
        <label className="label">Telefone para notificações</label>
        <input
          className="input"
          value={form.notify_phone ?? ''}
          onChange={(e) => set('notify_phone', e.target.value)}
          placeholder="5511999990000"
        />
        <p className="text-xs text-gray-500 mt-1">Número que receberá alertas via WhatsApp</p>
      </div>

      {error && <p className="text-sm text-danger-400">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Spinner size="sm" /> : null}
          {isEdit ? 'Salvar alterações' : 'Criar cliente'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.push('/clients')}
          disabled={saving}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
