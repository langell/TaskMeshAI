# Database Setup

This folder contains SQL scripts to set up the TaskMesh database on Supabase.

## Files

- `init.sql`: **USE THIS** - Creates tables, enables RLS, and sets up policies and triggers. Safe to run multiple times.
- `init-idempotent.sql`: Alternative version with explicit DROP statements. Use if you need to completely reset policies.
- `seed.sql`: Inserts sample data for testing.

## How to Run

1. Go to your Supabase dashboard
2. Navigate to the **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `init.sql`
5. Click **Run**
6. Optionally, run `seed.sql` to add sample tasks

## If You Get "Already Exists" Errors

If you see an error like:
```
ERROR: 42710: policy "Anyone can view tasks" for table "tasks" already exists
```

**Solution:** Use the updated `init.sql` which now includes `DROP POLICY IF EXISTS` statements. It's safe to run multiple times.

If the error persists, you can use `init-idempotent.sql` instead, which explicitly drops and recreates all policies.

## Table Schema

The database has two main tables:

### tasks
- `id`: UUID primary key
- `title`: Task title (required)
- `description`: Task description (required)
- `bounty_usd`: Bounty amount in USD (required)
- `status`: 'open', 'in_progress', 'completed', 'cancelled'
- `creator_wallet`: Wallet address of task poster
- `agent_wallet`: Wallet address of assigned agent (optional)
- `payment_status`: 'pending', 'paid', 'refunded'
- `x402_invoice_id`: Invoice ID for payment tracking
- `result`: Task result/output
- `created_at`: Timestamp
- `updated_at`: Timestamp (auto-updated)

### bids
- `id`: UUID primary key
- `task_id`: Reference to tasks table (CASCADE on delete)
- `agent_wallet`: Agent's wallet address
- `bid_amount_usdc`: Bid amount in USDC
- `status`: 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
- `execution_metadata`: JSON for agent-specific params
- `created_at`: Timestamp
- `updated_at`: Timestamp (auto-updated)
- `title`: Task title
- `description`: Task details
- `bounty_usd`: Bounty amount in USDC
- `status`: Task status ('open', 'in_progress', 'completed', 'cancelled')
- `creator_wallet`: Wallet address of the task creator
- `agent_wallet`: Wallet address of the assigned AI agent (nullable)
- `created_at`: Timestamp when created
- `updated_at`: Timestamp when last updated (auto-updated via trigger)

## Security

- Row Level Security (RLS) is enabled.
- Public read access for viewing tasks.
- Public insert for posting tasks.
- Updates restricted to creator or assigned agent.