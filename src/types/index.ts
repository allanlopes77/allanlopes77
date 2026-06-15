export interface Client {
  id: string
  name: string
  whatsapp_group_id: string
  clickup_list_id: string | null
  tone_instructions: string | null
  notify_phone: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  client_id: string
  zapi_message_id: string | null
  sender_phone: string
  body: string
  received_at: string
}

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'sent'

export interface Suggestion {
  id: string
  message_id: string
  client_id: string
  original_text: string
  suggested_text: string
  edited_text: string | null
  status: SuggestionStatus
  reject_reason: string | null
  created_at: string
  resolved_at: string | null
  client?: Client
  message?: Message
}

export interface ClickUpTask {
  id: string
  name: string
  status: string
  due_date: string | null
  url: string
}

export interface ZApiWebhookPayload {
  instanceId?: string
  messageId?: string
  phone?: string          // group JID e.g. "5511999990001-group@g.us"
  fromMe?: boolean
  momment?: number
  type?: string           // "ReceivedCallback" | "MessageStatusCallback"
  photo?: string
  audio?: boolean
  text?: {
    message?: string
  }
  isGroup?: boolean
  isNewsletter?: boolean
  broadcast?: boolean
  participantPhone?: string
  senderName?: string
}

export interface CreateClientPayload {
  name: string
  whatsapp_group_id: string
  clickup_list_id?: string
  tone_instructions?: string
  notify_phone?: string
}
