import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { agent_wallet } = await request.json();

  const { error } = await supabase
    .from('tasks')
    .update({ status: 'in_progress', agent_wallet })
    .eq('id', params.id)
    .eq('status', 'open');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}