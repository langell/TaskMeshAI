import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { agent_wallet } = await request.json();

  // TODO: Actually perform the task (e.g., summarize, etc.)
  // For now, just mark as completed

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', params.id)
    .eq('agent_wallet', agent_wallet);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}