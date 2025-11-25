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

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Anyone can view tasks" ON tasks;
DROP POLICY IF EXISTS "Anyone can post tasks" ON tasks;
DROP POLICY IF EXISTS "Creator or agent can update tasks" ON tasks;

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create bids table for agent bidding system
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_wallet TEXT NOT NULL,
  bid_amount_usdc NUMERIC NOT NULL CHECK (bid_amount_usdc > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  execution_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, agent_wallet)
);

-- Enable RLS for bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
DROP POLICY IF EXISTS "Anyone can create bids" ON bids;
DROP POLICY IF EXISTS "Agent can update own bid" ON bids;

-- Policies for bids
CREATE POLICY "Anyone can view bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Anyone can create bids" ON bids FOR INSERT WITH CHECK (true);
CREATE POLICY "Agent can update own bid" ON bids FOR UPDATE
USING (agent_wallet = current_setting('request.jwt.claims', true)::json->>'wallet')
WITH CHECK (agent_wallet = current_setting('request.jwt.claims', true)::json->>'wallet');

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;
DROP TRIGGER IF EXISTS validate_bid_amount ON bids;

-- Function to validate bid amount doesn't exceed task bounty
CREATE OR REPLACE FUNCTION validate_bid_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bid_amount_usdc > (SELECT bounty_usd FROM tasks WHERE id = NEW.task_id) THEN
    RAISE EXCEPTION 'Bid amount % exceeds task bounty', NEW.bid_amount_usdc;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to validate bid amount on insert/update
CREATE TRIGGER validate_bid_amount
  BEFORE INSERT OR UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION validate_bid_amount();

-- Trigger for bids updated_at
CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();