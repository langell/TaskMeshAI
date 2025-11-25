# Supabase Setup Guide

This guide walks you through setting up Supabase connectivity for TaskMeshAI.

## Quick Start

1. **Create a Supabase Account** (if you don't have one)
   - Go to https://supabase.com
   - Sign up for free

2. **Create a new project**
   - Click "New Project"
   - Choose a name, password, and region
   - Wait for it to initialize (~2 minutes)

3. **Get your credentials**
   - Go to Project Settings → API Keys
   - Copy the "Project URL"
   - Copy the "anon public" API key

4. **Update `.env.local`**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Verify the connection**
   ```bash
   pnpm verify:supabase
   ```

## Detailed Setup Steps

### Step 1: Supabase Project

1. Log in to https://app.supabase.com
2. Click "New Project" in the top-right
3. Fill in project details:
   - **Name**: taskmesh (or your preference)
   - **Database Password**: Strong password (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait for initialization

### Step 2: Get API Credentials

1. In your project, click **Settings** (⚙️) in bottom-left
2. Go to **API** tab
3. Look for:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **API Keys** section:
     - **anon public**: Your public API key
4. Copy both values

### Step 3: Set Environment Variables

1. Open `.env.local` in the project root
2. Replace placeholder values:
   ```bash
   # Before:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # After:
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh12345.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 4: Initialize Database Schema

TaskMeshAI needs database tables for `tasks` and `bids`. Initialize them:

```bash
# Option A: Using Supabase dashboard
1. Go to your project dashboard
2. Click "SQL Editor" on the left
3. Click "New Query"
4. Copy the contents of database/init.sql
5. Paste into the query editor
6. Click "Run"

# Option B: Using Supabase CLI (advanced)
pnpm supabase db push
```

See `database/init.sql` for the schema.

### Step 5: Verify Connection

Run the verification script:

```bash
pnpm verify:supabase
```

Expected output:
```
🔍 Verifying Supabase Configuration...

📋 Environment Variables:
  URL: ✓ Set
  Key: ✓ Set

🔗 Initializing Supabase Client...

📡 Testing Connection...
✓ Successfully connected to Supabase

🔐 Testing Authentication...
✓ Authentication configured

📊 Verifying Database Schema...
✓ Table exists: tasks
✓ Table exists: bids

✅ All checks passed! Supabase is properly configured.
```

## Troubleshooting

### Error: "Placeholder values detected"

**Problem:** You haven't replaced the placeholder credentials yet.

**Solution:**
1. Copy real credentials from https://app.supabase.com/projects
2. Update `.env.local` with actual values
3. Run `pnpm verify:supabase` again

### Error: "Connection Failed: Auth is disabled"

**Problem:** RLS (Row Level Security) policy is misconfigured.

**Solution:**
1. Go to your Supabase dashboard
2. Click **SQL Editor**
3. Click **"Task: Auth disabled"** to see the issue
4. Usually you need to enable anonymous access or fix RLS policies

### Error: "Table missing: tasks" or "Table missing: bids"

**Problem:** Database schema hasn't been initialized.

**Solution:**
1. Go to your Supabase dashboard
2. Click **SQL Editor** → **New Query**
3. Copy all contents from `database/init.sql`
4. Paste into query editor and click **Run**

### Error: "Failed to resolve origin"

**Problem:** CORS policy issue (usually for localhost development).

**Solution:**
1. This is normal for local development
2. Go to your Supabase project settings
3. Click **Auth** → **URL Configuration**
4. Add `http://localhost:3000` to "Redirect URLs"

### WebSocket Connection Failed

**Problem:** You see WebSocket errors in browser console like:
```
WebSocket connection to 'wss://your-project.supabase.co/realtime...' failed
```

**Solution:**
- These are expected if your credentials are placeholder values
- Once real credentials are added, this will resolve
- WebSocket errors don't prevent the app from working, just realtime features

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://abcdef.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `eyJ...` | Supabase public anon key |
| `NEXT_PUBLIC_TREASURY_WALLET` | No | `0x000...000` | Blockchain wallet for receiving payments |

## Database Schema

The app uses two main tables:

- **`tasks`**: Task listings posted by users
  - `id`, `title`, `description`, `bounty_amount`, `creator_address`, `status`, etc.

- **`bids`**: Bids submitted by agents on tasks
  - `id`, `task_id`, `agent_address`, `bid_amount`, `agent_message`, `status`, etc.

See `database/init.sql` for the complete schema.

## Development Tips

### Working with Real Data

After setup, you can:

1. **Seed test data**:
   ```bash
   # Manual insert via Supabase dashboard
   # Or use: pnpm db:seed (if implemented)
   ```

2. **Monitor data in Supabase dashboard**:
   - Click **Table Editor** in left sidebar
   - View live updates to tasks and bids

3. **Inspect network requests**:
   - Open browser DevTools → Network tab
   - Look for requests to `supabase.co`
   - Check response status and payload

### Testing Realtime Features

Supabase realtime subscriptions require proper setup:

1. Open the app in two browser windows
2. Post a task in one window
3. Should instantly appear in the other window's task list
4. Check browser console for realtime subscription logs

## Next Steps

After verifying connection:

1. Run the app: `pnpm dev`
2. Open http://localhost:3000
3. Post a test task with blockchain wallet
4. Submit a test bid
5. Check Supabase dashboard to see data inserted

## Support

- Supabase docs: https://supabase.com/docs
- Project dashboard: https://app.supabase.com/projects
- For issues: Check `.env.local` is set and run `pnpm verify:supabase`
