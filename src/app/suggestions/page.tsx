import { createServerClient } from '@/lib/supabase/server'
import { SuggestionList } from '@/components/suggestions/SuggestionList'
import type { Suggestion } from '@/types'

export const revalidate = 0

export default async function SuggestionsPage() {
  const supabase = createServerClient()

  const { data } = await supabase
    .from('suggestions')
    .select('*, client:clients(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const suggestions: Suggestion[] = data ?? []

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-100">Sugestões de resposta</h1>
        <p className="text-sm text-gray-500 mt-1">
          Revise, edite e aprove as respostas geradas pela IA para seus grupos de WhatsApp.
        </p>
      </div>
      <SuggestionList initial={suggestions} />
    </div>
  )
}
