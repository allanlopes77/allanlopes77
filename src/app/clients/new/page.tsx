import { ClientForm } from '@/components/clients/ClientForm'

export default function NewClientPage() {
  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-100">Novo cliente</h1>
        <p className="text-sm text-gray-500 mt-1">Configure um novo grupo de WhatsApp para monitorar</p>
      </div>
      <ClientForm />
    </div>
  )
}
