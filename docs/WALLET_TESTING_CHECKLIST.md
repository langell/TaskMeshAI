# Wallet Testing Checklist

Complete this checklist to thoroughly test the wallet interface without risking real tokens.

## Setup (15 minutes)

- [ ] Install MetaMask browser extension
- [ ] Create new wallet or import existing
- [ ] Add Base Sepolia testnet to MetaMask
- [ ] Get test USDC from faucet (https://faucet.circle.com)
- [ ] Verify USDC balance shows in MetaMask (~0.10 USDC minimum)
- [ ] Start app: `pnpm dev`
- [ ] Open http://localhost:3000

## Connection Tests (5 minutes)

### Connect Wallet
- [ ] Click "Connect Wallet" button
- [ ] MetaMask popup appears
- [ ] Account selection visible
- [ ] Select account and click "Connect"
- [ ] Popup closes
- [ ] Wallet address displayed on page
- [ ] Address matches MetaMask

### Wallet Display
- [ ] Wallet address formatted as `0x1234...5678`
- [ ] Full address visible on hover (check with DevTools)
- [ ] "Connected" status shown
- [ ] "Disconnect" button visible
- [ ] No console errors

### Disconnect Wallet
- [ ] Click "Disconnect" button
- [ ] Wallet address disappears
- [ ] "Connect Wallet" button re-appears
- [ ] Page remains functional
- [ ] No console errors

## Chain Detection Tests (5 minutes)

### Correct Chain
- [ ] MetaMask set to Base Sepolia
- [ ] App loads without errors
- [ ] "Please switch to Base" warning does NOT appear
- [ ] Post Task form is ENABLED

### Wrong Chain (Ethereum Mainnet)
- [ ] Switch MetaMask to Ethereum Mainnet
- [ ] Refresh page
- [ ] Warning appears: "Please switch to Base network"
- [ ] Auto-switch button visible
- [ ] Click "Switch to Base"
- [ ] MetaMask prompts for approval
- [ ] Approve chain switch
- [ ] Warning disappears
- [ ] Form becomes enabled

### Switch Back to Correct Chain
- [ ] Manually switch to different network in MetaMask
- [ ] App detects wrong chain
- [ ] Warning reappears automatically
- [ ] Can switch back

## USDC Balance Tests (5 minutes)

### Check Balance
- [ ] Open MetaMask
- [ ] Look for "USDC on Base Sepolia" token
- [ ] Balance shows ~0.10 USDC (or more)
- [ ] In app, USDC input accepts values

### Zero Balance
- [ ] Use test wallet with 0 USDC
- [ ] Try to post task with 0.10 USDC
- [ ] MetaMask rejects with "insufficient balance"
- [ ] Transaction does NOT complete
- [ ] Task NOT created in database

### Enough Balance
- [ ] Wallet has 0.10+ USDC
- [ ] Post task with 0.05 USDC bounty
- [ ] MetaMask allows transaction
- [ ] Transaction completes successfully

## Task Posting Tests (10 minutes)

### Post Task (Valid Data)
- [ ] Fill form with valid data:
  - Title: "Test task"
  - Description: "Testing wallet integration"
  - Bounty: 0.05 USDC
- [ ] Click "Post Task & Pay"
- [ ] MetaMask confirmation popup appears
- [ ] Shows correct amount (0.05 USDC)
- [ ] Shows correct recipient
- [ ] Shows gas fee (should be low, ~$0.01)
- [ ] Click "Confirm"
- [ ] Transaction submitted
- [ ] "Payment submitted!" message shows
- [ ] Transaction hash visible
- [ ] Task appears in task list within 5 seconds

### Post Task (Empty Fields)
- [ ] Leave title empty
- [ ] Click "Post Task & Pay"
- [ ] Error: "Please fill in all fields"
- [ ] MetaMask popup does NOT appear
- [ ] No transaction sent

### Post Task (Zero Bounty)
- [ ] Set bounty to 0
- [ ] Click "Post Task & Pay"
- [ ] Error: "Bounty must be greater than 0"
- [ ] MetaMask popup does NOT appear

### Post Task (Negative Bounty)
- [ ] Try to enter negative number
- [ ] Input should reject or show as 0
- [ ] Form validates properly

### Bounty Calculation
- [ ] Enter bounty: 1.00 USDC
- [ ] Set bid amount: 0.60 USDC
- [ ] Should show: "You profit: $0.40 USDC"
- [ ] Math is correct

## Bidding Tests (10 minutes)

### View Task
- [ ] Open posted task
- [ ] All task details visible:
  - Title ✓
  - Description ✓
  - Bounty amount ✓
  - Creator wallet ✓
  - Status ✓

### Place Bid (Valid)
- [ ] Task shows "Place Bid" button
- [ ] Click "Place Bid"
- [ ] Bid form appears
- [ ] Default bid = 80% of bounty (e.g., 0.80 USDC for 1.00 bounty)
- [ ] Can edit bid amount
- [ ] Profit calculation shows correctly
- [ ] Click "Submit Bid"
- [ ] Bid form closes
- [ ] Bid appears in list

### Place Bid (Too High)
- [ ] Set bid amount > bounty
- [ ] Error: "Bid must be between $0.01 and $X.XX"
- [ ] Form does NOT submit
- [ ] No transaction sent

### Place Bid (Zero/Negative)
- [ ] Set bid to 0 or negative
- [ ] Error appears
- [ ] Form does NOT submit

### Multiple Bids
- [ ] Post task with Wallet A
- [ ] Switch to Wallet B
- [ ] Place bid with Wallet B
- [ ] Switch to Wallet C
- [ ] Place another bid with Wallet C
- [ ] Both bids visible in list
- [ ] Each shows correct bidder wallet

## Multi-Wallet Tests (10 minutes)

### Different Wallets
- [ ] Have 2-3 test wallets set up in MetaMask
- [ ] Each has ~0.10+ USDC balance

### Switch Wallets
- [ ] MetaMask: Switch to Wallet A
- [ ] Refresh app
- [ ] App shows Wallet A connected
- [ ] Post task with Wallet A
- [ ] MetaMask: Switch to Wallet B
- [ ] App updates to show Wallet B
- [ ] Can see all tasks
- [ ] Can place bids as Wallet B

### Task Ownership
- [ ] Wallet A posts task
- [ ] Switch to Wallet B
- [ ] Can see Wallet A's task
- [ ] Cannot delete/edit Wallet A's task
- [ ] Can place bid on Wallet A's task

### Accept Bid (Creator)
- [ ] Wallet A posted task
- [ ] Wallet B placed bid
- [ ] Switch to Wallet A
- [ ] See bid in task detail
- [ ] "Accept Bid" button visible
- [ ] Click "Accept Bid"
- [ ] MetaMask confirms
- [ ] Bid status changes to "accepted"
- [ ] Task status changes to "in_progress"

## Database Verification Tests (5 minutes)

### Check Supabase
- [ ] Open Supabase dashboard
- [ ] Go to Table Editor
- [ ] Click "tasks" table
- [ ] See all posted tasks:
  - [ ] Title matches
  - [ ] Description matches
  - [ ] Bounty matches
  - [ ] Creator wallet matches
  - [ ] Status is "open"
  - [ ] payment_status is "paid"
  - [ ] created_at timestamp recent

### Check Bids
- [ ] Click "bids" table
- [ ] See all placed bids:
  - [ ] task_id references correct task
  - [ ] agent_wallet is bidder's wallet
  - [ ] bid_amount_usdc matches
  - [ ] status is correct
  - [ ] created_at timestamp recent

### Check Updates
- [ ] Post new task
- [ ] Refresh Supabase dashboard
- [ ] New task appears in table
- [ ] All fields populated correctly

## Error Handling Tests (5 minutes)

### No Wallet Connected
- [ ] Disconnect wallet
- [ ] Try to post task
- [ ] Button disabled (grayed out)
- [ ] Or shows error message
- [ ] Can reconnect and try again

### Transaction Rejected
- [ ] Start to post task
- [ ] MetaMask confirmation appears
- [ ] Click "Reject"
- [ ] Transaction cancelled
- [ ] Task NOT created
- [ ] Error message shown
- [ ] Can retry

### Insufficient Balance (Mid-Transaction)
- [ ] Have 0.05 USDC
- [ ] Try to post 0.10 USDC task
- [ ] MetaMask shows error
- [ ] Transaction rejected
- [ ] Appropriate error message

### Network Error
- [ ] Disconnect internet (or use DevTools throttling)
- [ ] Try to submit task
- [ ] Error message appears
- [ ] Can reconnect and retry

## Console & DevTools Tests (5 minutes)

### No Errors
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] No red error messages
- [ ] No "Hydration" errors
- [ ] No "undefined" errors
- [ ] Check Network tab - no 500 errors

### Transaction Logs
- [ ] Post task
- [ ] Check Console for log messages:
  - [ ] "Sending payment: {...}"
  - [ ] "Payment sent: 0x..."
  - [ ] Task creation messages
- [ ] Can see transaction hash

### Network Requests
- [ ] Check Network tab
- [ ] POST to `/api/tasks` - status 200
- [ ] Response includes task data
- [ ] No failed requests

## Performance Tests (5 minutes)

### Task List Updates
- [ ] Post task
- [ ] Check how long until appears in list
- [ ] Should be <5 seconds
- [ ] Check Realtime updates working

### Form Responsiveness
- [ ] Type in title field
- [ ] No lag or delays
- [ ] Form inputs responsive
- [ ] Buttons click immediately

### Bid Submission
- [ ] Place bid
- [ ] Should appear in list within 2-3 seconds
- [ ] No loading delays

## Final Integration Test (5 minutes)

Complete workflow test:

1. [ ] **Setup:** Connect Wallet A with 0.20 USDC
2. [ ] **Post:** Create "Write summary" task, 0.15 USDC bounty
3. [ ] **Verify DB:** Check task in Supabase
4. [ ] **Switch:** Change to Wallet B with 0.20 USDC
5. [ ] **Bid:** Place bid of 0.10 USDC on task
6. [ ] **Verify DB:** Check bid in Supabase
7. [ ] **Accept:** Switch back to Wallet A
8. [ ] **Accept Bid:** Accept Wallet B's bid
9. [ ] **Verify:** Task shows "in_progress", bid shows "accepted"
10. [ ] **Complete:** Check all data consistent in database

## Sign-Off

- [ ] All tests passed
- [ ] No console errors
- [ ] Wallet connection smooth
- [ ] Transactions work correctly
- [ ] Database updates accurate
- [ ] Ready for development

**Tested By:** ___________________  
**Date:** ___________________  
**Notes:** 
```
_______________________________________________________
_______________________________________________________
```
