import { createServerClient } from './supabase/server'
import { getOpenTasks } from './clickup'
import type { Client, Message, ClickUpTask } from '@/types'

export interface AssembledContext {
  client: Client
  recentMessages: Array<{ sender: string; body: string }>
  openTasks: ClickUpTask[]
}

export async function assembleContext(
  client: Client,
  excludeMessageId?: string
): Promise<AssembledContext> {
  const supabase = createServerClient()

  const { data: rows } = await supabase
    .from('messages')
    .select('sender_phone, body, zapi_message_id')
    .eq('client_id', client.id)
    .order('received_at', { ascending: false })
    .limit(10)

  const recentMessages: Array<{ sender: string; body: string }> = (rows ?? [])
    .filter((m: Message) => m.zapi_message_id !== excludeMessageId)
    .reverse()
    .map((m: Message) => ({ sender: m.sender_phone, body: m.body }))

  const openTasks = client.clickup_list_id
    ? await getOpenTasks(client.clickup_list_id)
    : []

  return { client, recentMessages, openTasks }
}
