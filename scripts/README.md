# Scripts Directory

Utility scripts for TaskMeshAI development and maintenance.

## Available Scripts

### `verify-supabase.ts`

Verify that Supabase is properly configured and connected.

**Usage:**
```bash
pnpm verify:supabase
```

**What it checks:**
- ✓ Environment variables are set (not placeholder values)
- ✓ Can connect to Supabase API
- ✓ Authentication is configured
- ✓ Required database tables exist (`tasks`, `bids`)

**Example output:**
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

**Troubleshooting:**
- If you see "Placeholder values detected", update `.env.local` with real credentials from https://app.supabase.com
- If tables don't exist, run the database initialization script at `database/init.sql`

## Adding New Scripts

1. Create a new `.ts` file in this directory
2. Add a corresponding npm script to `package.json` 
3. Document it in this README

## Running Scripts

TypeScript scripts can be run directly with `ts-node` or added as npm scripts for easier access.
