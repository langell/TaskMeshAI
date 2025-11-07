-- Database setup for TaskMesh MVP
-- Run this in Supabase SQL Editor or via CLI

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  bounty_usd NUMERIC NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  creator_wallet TEXT NOT NULL,
  agent_wallet TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  x402_invoice_id TEXT,
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for public access (since it's a public marketplace)
-- Allow anyone to read tasks
CREATE POLICY "Anyone can view tasks" ON tasks FOR SELECT USING (true);

-- Allow anyone to insert tasks (post new tasks)
CREATE POLICY "Anyone can post tasks" ON tasks FOR INSERT WITH CHECK (true);

-- Allow updates only by creator or assigned agent
CREATE POLICY "Creator or agent can update tasks" ON tasks FOR UPDATE
USING (
  creator_wallet = current_setting('request.jwt.claims', true)::json->>'wallet' OR
  agent_wallet = current_setting('request.jwt.claims', true)::json->>'wallet'
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create bids table for agent bidding system
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_wallet TEXT NOT NULL,
  bid_amount_usdc NUMERIC NOT NULL CHECK (bid_amount_usdc > 0 AND bid_amount_usdc <= (SELECT bounty_usd FROM tasks WHERE tasks.id = task_id)),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  execution_metadata JSONB, -- Store agent-specific execution params
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, agent_wallet) -- Only one bid per agent per task
);

-- Enable RLS for bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Policies for bids
CREATE POLICY "Anyone can view bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Anyone can create bids" ON bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Agent can update own bid" ON bids FOR UPDATE
USING (agent_wallet = current_setting('request.jwt.claims', true)::json->>'wallet')
WITH CHECK (agent_wallet = current_setting('request.jwt.claims', true)::json->>'wallet');

-- Trigger for bids updated_at
CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();