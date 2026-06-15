'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { Suggestion } from '@/types'

interface Props {
  suggestion: Suggestion
  open: boolean
  onClose: () => void
  onSaved: (updated: Suggestion) => void
}

export function EditSuggestionModal({ suggestion, open, onClose, onSaved }: Props) {
  const [text, setText] = useState(suggestion.edited_text ?? suggestion.suggested_text)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}/edit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edited_text: text }),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated: Suggestion = await res.json()
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Editar sugestão">
      <div className="space-y-4">
        <div>
          <p className="label">Mensagem original</p>
          <p className="text-sm text-gray-400 bg-surface-700/50 rounded-lg px-3 py-2">
            {suggestion.original_text}
          </p>
        </div>

        <div>
          <label className="label">Resposta sugerida (editável)</label>
          <textarea
            className="input min-h-[120px] resize-y"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-danger-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !text.trim()}>
            {saving ? <Spinner size="sm" /> : null}
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  )
}
