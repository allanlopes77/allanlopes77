import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ClientCard } from '@/components/clients/ClientCard'
import type { Client } from '@/types'

export const revalidate = 0

export default async function ClientsPage() {
  const supabase = createServerClient()
  const { data } = await supabase.from('clients').select('*').order('name')
  const clients: Client[] = data ?? []

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os grupos monitorados</p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          + Novo cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="card text-center py-10 text-gray-500">
          <p>Nenhum cliente cadastrado.</p>
          <Link href="/clients/new" className="btn-primary mt-4 inline-flex">
            Criar primeiro cliente
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      )}
    </div>
  )
}
