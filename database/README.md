# Database Setup

This folder contains SQL scripts to set up the TaskMesh database on Supabase.

## Files

- `init.sql`: Creates the `tasks` table, enables RLS, and sets up policies and triggers.
- `seed.sql`: Inserts sample data for testing.

## How to Run

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/txahfohkyooaqeduprfr
2. Navigate to the SQL Editor.
3. Copy and paste the contents of `init.sql` and run it.
4. Optionally, run `seed.sql` to add sample tasks.

## Table Schema

The `tasks` table has the following columns:
- `id`: UUID primary key
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