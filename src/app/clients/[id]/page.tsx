import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ClientForm } from '@/components/clients/ClientForm'
import type { Client } from '@/types'

export const revalidate = 0

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('clients').select('*').eq('id', params.id).single()

  if (error || !data) notFound()
  const client = data as Client

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-100">Editar cliente</h1>
        <p className="text-sm text-gray-500 mt-1">{client.name}</p>
      </div>
      <ClientForm initial={client} />
    </div>
  )
}
