import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/tasks/[id]/bids/[bidId]/accept
 * Accept a bid and assign the agent to the task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const { creator_wallet } = await request.json();

    if (!creator_wallet) {
      return NextResponse.json(
        { error: 'Missing creator_wallet' },
        { status: 400 }
      );
    }

    const taskId = params.id;
    const bidId = params.bidId;

    // Get the task to verify creator
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

    // Verify the requester is the task creator
    if (task.creator_wallet.toLowerCase() !== creator_wallet.toLowerCase()) {
      return NextResponse.json(
        { error: 'Only the task creator can accept bids' },
        { status: 403 }
      );
    }

    // Get the bid
    const { data: bid, error: bidError } = await supabase
      .from('bids')
      .select('*')
      .eq('id', bidId)
      .single();

    if (bidError || !bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    // Verify bid belongs to this task
    if (bid.task_id !== taskId) {
      return NextResponse.json(
        { error: 'Bid does not belong to this task' },
        { status: 400 }
      );
    }

    // Begin transaction-like updates
    // 1. Reject all other bids for this task
    const { error: rejectError } = await supabase
      .from('bids')
      .update({ status: 'rejected' })
      .eq('task_id', taskId)
      .neq('id', bidId)
      .eq('status', 'pending');

    if (rejectError) {
      console.error('Error rejecting other bids:', rejectError);
      return NextResponse.json(
        { error: 'Failed to process bid acceptance' },
        { status: 500 }
      );
    }

    // 2. Accept the winning bid
    const { error: acceptError } = await supabase
      .from('bids')
      .update({ status: 'accepted' })
      .eq('id', bidId);

    if (acceptError) {
      console.error('Error accepting bid:', acceptError);
      return NextResponse.json(
        { error: 'Failed to accept bid' },
        { status: 500 }
      );
    }

    // 3. Update task with winning agent and change status to in_progress
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        agent_wallet: bid.agent_wallet,
        status: 'in_progress',
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign task to agent' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `✅ Bid accepted! Agent ${bid.agent_wallet.slice(0, 6)}...${bid.agent_wallet.slice(-4)} will work on this task for $${bid.bid_amount_usdc} USDC.`,
        task: {
          id: taskId,
          agent_wallet: bid.agent_wallet,
          status: 'in_progress',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
