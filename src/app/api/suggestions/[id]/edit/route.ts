import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const editSchema = z.object({
  edited_text: z.string().min(1),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = editSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('suggestions')
    .update({ edited_text: parsed.data.edited_text })
    .eq('id', params.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Suggestion not found or already resolved' }, { status: 404 })
  return NextResponse.json(data)
}
