'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EditSuggestionModal } from './EditSuggestionModal'
import type { Suggestion } from '@/types'

interface Props {
  suggestion: Suggestion
  onUpdate: (updated: Suggestion) => void
}

export function SuggestionCard({ suggestion: initial, onUpdate }: Props) {
  const [suggestion, setSuggestion] = useState(initial)
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPending = suggestion.status === 'pending'
  const displayText = suggestion.edited_text ?? suggestion.suggested_text

  async function approve() {
    setLoading('approve')
    setError(null)
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      const updated: Suggestion = await res.json()
      setSuggestion(updated)
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar')
    } finally {
      setLoading(null)
    }
  }

  async function reject() {
    setLoading('reject')
    setError(null)
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}/reject`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      const updated: Suggestion = await res.json()
      setSuggestion(updated)
      onUpdate(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="card space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">
              {new Date(suggestion.created_at).toLocaleString('pt-BR')}
              {suggestion.client && (
                <span className="ml-2 text-brand-400 font-medium">{suggestion.client.name}</span>
              )}
            </p>
            <p className="text-sm text-gray-400 line-clamp-2">
              <span className="text-gray-500 mr-1">Recebida:</span>
              {suggestion.original_text}
            </p>
          </div>
          <Badge status={suggestion.status} />
        </div>

        <div className="bg-surface-700/50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-500 mb-1">
            Sugestão{suggestion.edited_text ? ' (editada)' : ''}
          </p>
          <p className="text-sm text-gray-100 whitespace-pre-wrap">{displayText}</p>
        </div>

        {error && <p className="text-xs text-danger-400">{error}</p>}

        {isPending && (
          <div className="flex items-center gap-2 pt-1">
            <button
              className="btn-success"
              onClick={approve}
              disabled={loading !== null}
            >
              {loading === 'approve' ? <Spinner size="sm" /> : '✓'}
              Aprovar e enviar
            </button>
            <button
              className="btn-ghost"
              onClick={() => setEditOpen(true)}
              disabled={loading !== null}
            >
              ✏️ Editar
            </button>
            <button
              className="btn-danger ml-auto"
              onClick={reject}
              disabled={loading !== null}
            >
              {loading === 'reject' ? <Spinner size="sm" /> : '✕'}
              Rejeitar
            </button>
          </div>
        )}
      </div>

      {editOpen && (
        <EditSuggestionModal
          suggestion={suggestion}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setSuggestion(updated)
            onUpdate(updated)
          }}
        />
      )}
    </>
  )
}
