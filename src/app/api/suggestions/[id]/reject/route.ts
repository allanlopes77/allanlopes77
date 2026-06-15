import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const rejectSchema = z.object({
  reason: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  let body: unknown = {}
  try {
    body = await req.json()
  } catch { /* reason is optional */ }

  const parsed = rejectSchema.safeParse(body)

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('suggestions')
    .update({
      status: 'rejected',
      reject_reason: parsed.success ? (parsed.data.reason ?? null) : null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Suggestion not found or already resolved' }, { status: 404 })
  return NextResponse.json(data)
}
