import type { ClickUpTask } from '@/types'

const BASE = 'https://api.clickup.com/api/v2'

function headers() {
  return {
    Authorization: process.env.CLICKUP_API_TOKEN!,
    'Content-Type': 'application/json',
  }
}

export async function getOpenTasks(listId: string): Promise<ClickUpTask[]> {
  if (!listId) return []

  const params = new URLSearchParams({
    statuses: JSON.stringify(['open', 'in progress', 'em andamento', 'a fazer']),
    include_closed: 'false',
    subtasks: 'true',
  })

  const res = await fetch(`${BASE}/list/${listId}/task?${params}`, {
    headers: headers(),
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    console.error(`ClickUp API error: ${res.status} for list ${listId}`)
    return []
  }

  const data = await res.json()
  const tasks: ClickUpTask[] = (data.tasks ?? []).map((t: Record<string, unknown>) => ({
    id: t.id as string,
    name: t.name as string,
    status: (t.status as { status?: string })?.status ?? 'unknown',
    due_date: t.due_date ? new Date(Number(t.due_date)).toLocaleDateString('pt-BR') : null,
    url: t.url as string,
  }))

  return tasks
}
