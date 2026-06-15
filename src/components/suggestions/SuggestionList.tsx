'use client'

import { useState } from 'react'
import { SuggestionCard } from './SuggestionCard'
import type { Suggestion, SuggestionStatus } from '@/types'

const FILTERS: Array<{ value: SuggestionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'rejected', label: 'Rejeitadas' },
]

export function SuggestionList({ initial }: { initial: Suggestion[] }) {
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<SuggestionStatus | 'all'>('pending')

  function handleUpdate(updated: Suggestion) {
    setItems((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  const filtered = filter === 'all' ? items : items.filter((s) => s.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const count = f.value === 'all' ? items.length : items.filter((s) => s.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-700 text-gray-400 hover:text-gray-100'
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-10 text-gray-500">
          Nenhuma sugestão {filter !== 'all' ? `com status "${filter}"` : ''}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <SuggestionCard key={s.id} suggestion={s} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}
