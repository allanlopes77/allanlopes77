import type { SuggestionStatus } from '@/types'

const map: Record<SuggestionStatus, string> = {
  pending: 'bg-warning-500/15 text-warning-400 border border-warning-500/30',
  approved: 'bg-brand-500/15 text-brand-400 border border-brand-500/30',
  rejected: 'bg-danger-500/15 text-danger-400 border border-danger-500/30',
  sent: 'bg-success-500/15 text-success-400 border border-success-500/30',
}

const label: Record<SuggestionStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  sent: 'Enviada',
}

export function Badge({ status }: { status: SuggestionStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  )
}
