import Anthropic from '@anthropic-ai/sdk'
import type { ClickUpTask } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GenerateSuggestionInput {
  clientName: string
  toneInstructions: string | null
  incomingMessage: string
  senderName: string | null
  recentMessages: Array<{ sender: string; body: string }>
  openTasks: ClickUpTask[]
}

export async function generateSuggestion(input: GenerateSuggestionInput): Promise<string> {
  const {
    clientName,
    toneInstructions,
    incomingMessage,
    senderName,
    recentMessages,
    openTasks,
  } = input

  const taskContext =
    openTasks.length > 0
      ? openTasks
          .map(
            (t) =>
              `- [${t.status.toUpperCase()}] ${t.name}${t.due_date ? ` (vence: ${t.due_date})` : ''}`
          )
          .join('\n')
      : 'Nenhuma tarefa aberta no momento.'

  const historyContext =
    recentMessages.length > 0
      ? recentMessages
          .map((m) => `${m.sender}: ${m.body}`)
          .join('\n')
      : 'Sem histórico recente.'

  const systemPrompt = `Você é um assistente de atendimento profissional para a agência que gerencia o cliente "${clientName}".
Seu papel é redigir respostas para mensagens recebidas no grupo de WhatsApp desse cliente.

${toneInstructions ? `INSTRUÇÕES DE TOM E ESTILO:\n${toneInstructions}\n` : ''}
REGRAS:
- Responda SOMENTE com o texto da mensagem, sem explicações, sem prefixos
- Seja direto, profissional e empático
- Use o contexto das tarefas abertas para personalizar a resposta quando relevante
- Responda em português brasileiro
- Não invente informações — se não souber algo, diga que vai verificar`

  const userPrompt = `TAREFAS ABERTAS NO CLICKUP:
${taskContext}

HISTÓRICO RECENTE DO GRUPO:
${historyContext}

NOVA MENSAGEM${senderName ? ` de ${senderName}` : ''}:
${incomingMessage}

Escreva uma resposta adequada para esta mensagem:`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text block')
  }

  return textBlock.text.trim()
}
