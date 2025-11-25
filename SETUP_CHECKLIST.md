# Quick Setup Checklist

Complete this checklist to get TaskMeshAI running locally with full Supabase integration.

## 1. Prerequisites
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Supabase account (free at https://supabase.com)

## 2. Clone & Install
- [ ] Clone repository: `git clone <repo-url>`
- [ ] Navigate to directory: `cd TaskMeshAI`
- [ ] Install dependencies: `pnpm install`

## 3. Create Supabase Project
- [ ] Go to https://app.supabase.com
- [ ] Create new project
- [ ] Wait for initialization (~2 minutes)
- [ ] Note your project URL and anon key

## 4. Configure Environment
- [ ] Open `.env.local` file
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here`
- [ ] Save the file

## 5. Initialize Database
- [ ] Go to Supabase dashboard → SQL Editor
- [ ] Create new query
- [ ] Copy contents from `database/init.sql`
- [ ] Paste and click "Run"
- [ ] Wait for schema to be created

## 6. Verify Connection
- [ ] Run: `pnpm verify:supabase`
- [ ] Should see all green checkmarks ✓
- [ ] If not, check `.env.local` values

## 7. Start Development
- [ ] Run: `pnpm dev`
- [ ] Open http://localhost:3000
- [ ] Should load without errors
- [ ] Check browser console (F12) - should be clean

## 8. Test Functionality (Optional)
- [ ] Install MetaMask extension
- [ ] Connect wallet on the app
- [ ] Try posting a test task
- [ ] Check Supabase dashboard → Table Editor
- [ ] Should see task data inserted

## 9. Run Tests (Optional)
- [ ] Run: `pnpm test`
- [ ] All 75 tests should pass
- [ ] Coverage should be ~65%

## Common Issues

### Error: "Placeholder values detected"
→ Replace `your-project` and `your-anon-key` with real values from Supabase

### Error: "Connection Failed"
→ Check your `.env.local` file exists in the project root

### Error: "Table missing: tasks"
→ Run the SQL schema from `database/init.sql` in Supabase SQL Editor

### WebSocket errors in browser console
→ Normal for development; resolves when real credentials are added

## Support Resources

- **Setup guide**: `docs/SUPABASE_SETUP.md`
- **Development guide**: `docs/DEVELOPMENT.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Supabase docs**: https://supabase.com/docs

## What's Next?

After setup is complete:

1. Explore the codebase structure (see `docs/ARCHITECTURE.md`)
2. Review the test suite (run `pnpm test`)
3. Check out contributing guidelines
4. Start building new features!

---

**Need help?** Check the docs folder or review error messages carefully - they usually point to the exact issue.
