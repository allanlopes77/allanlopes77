import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { assembleContext } from '@/lib/context-engine'
import { generateSuggestion } from '@/lib/claude'
import { sendTextMessage } from '@/lib/zapi'
import type { ZApiWebhookPayload, Client } from '@/types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get('x-webhook-secret')
  if (process.env.ZAPI_WEBHOOK_SECRET && secret !== process.env.ZAPI_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: ZApiWebhookPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Ignore non-message callbacks, outbound messages, newsletters, broadcasts
  if (
    payload.type !== 'ReceivedCallback' ||
    payload.fromMe ||
    payload.isNewsletter ||
    payload.broadcast ||
    !payload.isGroup ||
    !payload.phone ||
    !payload.text?.message
  ) {
    return NextResponse.json({ ok: true })
  }

  const groupId = payload.phone
  const messageText = payload.text.message
  const senderPhone = payload.participantPhone ?? groupId
  const senderName = payload.senderName ?? null
  const zapiMessageId = payload.messageId ?? null

  const supabase = createServerClient()

  // Find matching client by group id
  const { data: clientRow } = await supabase
    .from('clients')
    .select('*')
    .eq('whatsapp_group_id', groupId)
    .single()

  if (!clientRow) {
    // No client configured for this group — silently skip
    return NextResponse.json({ ok: true })
  }

  const client = clientRow as Client

  // Persist incoming message
  const { data: messageRow, error: msgError } = await supabase
    .from('messages')
    .insert({
      client_id: client.id,
      zapi_message_id: zapiMessageId,
      sender_phone: senderPhone,
      body: messageText,
    })
    .select('id')
    .single()

  if (msgError || !messageRow) {
    console.error('Failed to insert message:', msgError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // Assemble context (exclude the just-inserted message from history)
  const ctx = await assembleContext(client, zapiMessageId ?? undefined)

  // Generate suggestion
  let suggested: string
  try {
    suggested = await generateSuggestion({
      clientName: client.name,
      toneInstructions: client.tone_instructions,
      incomingMessage: messageText,
      senderName,
      recentMessages: ctx.recentMessages,
      openTasks: ctx.openTasks,
    })
  } catch (err) {
    console.error('Claude generation failed:', err)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }

  // Persist suggestion
  const { error: sugError } = await supabase.from('suggestions').insert({
    message_id: messageRow.id,
    client_id: client.id,
    original_text: messageText,
    suggested_text: suggested,
    status: 'pending',
  })

  if (sugError) {
    console.error('Failed to insert suggestion:', sugError)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // Notify owner via WhatsApp if configured
  if (client.notify_phone) {
    const preview = suggested.length > 120 ? suggested.slice(0, 117) + '...' : suggested
    const notif =
      `💬 *Nova mensagem* — ${client.name}\n` +
      `De: ${senderName ?? senderPhone}\n\n` +
      `_"${messageText}"_\n\n` +
      `📝 *Sugestão:*\n${preview}\n\n` +
      `Acesse o painel para aprovar, editar ou rejeitar.`

    try {
      await sendTextMessage(client.notify_phone, notif)
    } catch (err) {
      // Non-fatal: log but don't fail the webhook
      console.error('Notification failed:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
