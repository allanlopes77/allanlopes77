import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendTextToGroup } from '@/lib/zapi'
import type { Suggestion, Client } from '@/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const supabase = createServerClient()

  const { data: suggestion, error } = await supabase
    .from('suggestions')
    .select('*, client:clients(*)')
    .eq('id', params.id)
    .single()

  if (error || !suggestion) {
    return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
  }

  const s = suggestion as Suggestion & { client: Client }

  if (s.status !== 'pending') {
    return NextResponse.json({ error: `Cannot approve a suggestion with status "${s.status}"` }, { status: 409 })
  }

  const textToSend = s.edited_text ?? s.suggested_text

  try {
    await sendTextToGroup(s.client.whatsapp_group_id, textToSend)
  } catch (err) {
    console.error('Failed to send WhatsApp message:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 502 })
  }

  const { data: updated, error: updateError } = await supabase
    .from('suggestions')
    .update({ status: 'sent', resolved_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json(updated)
}
