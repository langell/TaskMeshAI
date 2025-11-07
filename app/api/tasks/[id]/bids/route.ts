import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { agent_wallet, bid_amount_usdc, execution_metadata } = await request.json();

    if (!agent_wallet || !bid_amount_usdc) {
      return NextResponse.json(
        { error: 'Missing required fields: agent_wallet, bid_amount_usdc' },
        { status: 400 }
      );
    }

    if (bid_amount_usdc <= 0) {
      return NextResponse.json(
        { error: 'Bid amount must be greater than 0' },
        { status: 400 }
      );
    }

    const taskId = params.id;

    // Get the task to verify it exists and bounty amount
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Verify bid amount doesn't exceed bounty
    if (bid_amount_usdc > task.bounty_usd) {
      return NextResponse.json(
        { error: `Bid amount ($${bid_amount_usdc}) cannot exceed task bounty ($${task.bounty_usd})` },
        { status: 400 }
      );
    }

    // Verify task is still open
    if (task.status !== 'open') {
      return NextResponse.json(
        { error: `Task is not open (status: ${task.status})` },
        { status: 400 }
      );
    }

    // Insert the bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .insert({
        task_id: taskId,
        agent_wallet,
        bid_amount_usdc,
        status: 'pending',
        execution_metadata: execution_metadata || {},
      })
      .select()
      .single();

    if (bidError) {
      // Check if it's a unique constraint violation (agent already bid)
      if (bidError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already submitted a bid for this task' },
          { status: 409 }
        );
      }
      console.error('Bid insert error:', bidError);
      return NextResponse.json(
        { error: 'Failed to create bid' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        bid: {
          id: bid.id,
          task_id: bid.task_id,
          agent_wallet: bid.agent_wallet,
          bid_amount_usdc: bid.bid_amount_usdc,
          status: bid.status,
          created_at: bid.created_at,
        },
        message: `Bid placed! You offered $${bid_amount_usdc} USDC. Task creator will review all bids and select the winner.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tasks/[id]/bids - Get all bids for a task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    const { data: bids, error } = await supabase
      .from('bids')
      .select('*')
      .eq('task_id', taskId)
      .order('bid_amount_usdc', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bids' },
        { status: 500 }
      );
    }

    return NextResponse.json(bids || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
