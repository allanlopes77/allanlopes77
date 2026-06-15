'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/Spinner'
import type { Client } from '@/types'

export function ClientCard({ client }: { client: Client }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="card flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-100">{client.name}</p>
        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">{client.whatsapp_group_id}</p>
        <div className="flex flex-wrap gap-3 mt-2">
          {client.clickup_list_id && (
            <span className="text-xs text-gray-500">📋 ClickUp: {client.clickup_list_id}</span>
          )}
          {client.notify_phone && (
            <span className="text-xs text-gray-500">📱 Notif: {client.notify_phone}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href={`/clients/${client.id}`} className="btn-ghost text-xs px-3 py-1.5">
          Editar
        </Link>
        <button
          className="btn-danger text-xs px-3 py-1.5"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Spinner size="sm" /> : 'Excluir'}
        </button>
      </div>
    </div>
  )
}
