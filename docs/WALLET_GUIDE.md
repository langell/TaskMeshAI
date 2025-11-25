# Wallet Interface & Testing Guide

This guide explains how TaskMeshAI's wallet integration works and how to test it **without real tokens**.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [How the Wallet Works](#how-the-wallet-works)
3. [Testing Without Real Tokens](#testing-without-real-tokens)
4. [Step-by-Step Testing Guide](#step-by-step-testing-guide)
5. [Troubleshooting](#troubleshooting)
6. [Technical Implementation Details](#technical-implementation-details)

---

## Architecture Overview

### Tech Stack

```
Wagmi 2.19.2           - Wallet connection & state management
Viem 2.23.2            - Low-level blockchain interaction
MetaMask Extension     - User's wallet provider
Base Chain (8453)      - Layer 2 blockchain (Ethereum-derived)
USDC Token             - Stable coin on Base
```

### Flow Diagram

```
User Browser
    ↓
MetaMask Extension
    ↓
Wagmi (Connection)
    ↓
Viem (Contract Interaction)
    ↓
Base Chain (8453)
    ↓
USDC Contract
```

---

## How the Wallet Works

### 1. **Wallet Connection Flow**

When a user clicks "Connect Wallet":

```typescript
// Component: PostTask.tsx, BidForm.tsx
const { address, isConnected, chainId } = useAccount();
const { connect } = useConnect();

// Connect wallet
connect({ connector: injected() });
```

**What happens:**
1. MetaMask popup appears
2. User approves connection
3. Wagmi stores: `address`, `isConnected`, `chainId`
4. Components re-render with connection state

### 2. **Chain Verification**

TaskMeshAI only works on **Base Chain (8453)**.

```typescript
// In PostTask.tsx
if (chainId !== 8453) {
  switchChain({ chainId: 8453 });
}
```

**Why Base?**
- ✅ Fast and cheap transactions
- ✅ USDC natively deployed
- ✅ Low gas fees (~$0.01 per transaction)
- ✅ Ethereum-compatible

### 3. **USDC Transfer Flow**

When posting a task or bidding:

```typescript
const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b1566469c18';

writeContract({
  address: USDC_ADDRESS,
  abi: USDC_ABI,
  functionName: 'transfer',
  args: [treasuryWallet, amount],
});
```

**Steps:**
1. User enters bounty amount (e.g., 0.30 USDC)
2. Click "Post Task & Pay"
3. MetaMask shows transaction confirmation
4. User approves the transfer
5. Transaction sent to Base blockchain
6. If approved, task created in database
7. Other users can now bid on it

### 4. **State Management**

```typescript
// Wagmi hooks track wallet state
const { address, isConnected, chainId } = useAccount();
const { connect, disconnect } = useConnect();
const { switchChain } = useSwitchChain();
const { writeContract } = useWriteContract();
```

**Key States:**
- `isConnected: boolean` - Wallet connected?
- `address: string | undefined` - Wallet address (e.g., `0x1234...`)
- `chainId: number | undefined` - Current network (8453 = Base)

---

## Testing Without Real Tokens

### Option 1: **MetaMask Testnet (Recommended for Development)**

#### Setup Steps:

1. **Install MetaMask** (if not already installed)
   - https://metamask.io/download/

2. **Switch to Base Testnet**
   - Open MetaMask
   - Click network dropdown (top-left)
   - Enable "Show test networks" in settings
   - Select "Base Sepolia" (testnet)

3. **Get Testnet USDC**
   - Go to https://faucet.circle.com
   - Select "Base Sepolia"
   - Paste your MetaMask address
   - Click "Send"
   - Wait ~1 minute to receive test USDC

4. **Start App**
   ```bash
   pnpm dev
   ```

5. **Connect & Test**
   - Open http://localhost:3000
   - Click "Connect Wallet"
   - Approve connection
   - MetaMask will switch to Base Sepolia automatically
   - Test USDC balance will show

#### Testnet Details:
```
Network: Base Sepolia
Chain ID: 84532 (not 8453!)
USDC Contract: 0x036CbD53842c5426634e7929541eC2cBA24954C
Faucet: https://faucet.circle.com
```

### Option 2: **Local Simulation (Advanced)**

If you don't want to use a testnet, simulate wallet interactions:

```typescript
// Mock wallet in tests
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    chainId: 8453,
  }),
}));
```

See `app/__tests__/api.test.ts` for full examples.

### Option 3: **Browser DevTools Simulation**

Using Chrome DevTools to inspect transactions:

1. Open DevTools (F12)
2. Go to Network tab
3. Post a task
4. Look for requests to:
   - `/api/tasks` (creates task)
   - MetaMask RPC calls (contract interaction)

---

## Step-by-Step Testing Guide

### **Test 1: Connect Wallet**

1. Start app: `pnpm dev`
2. Open http://localhost:3000
3. Click "Connect Wallet" button
4. MetaMask popup appears
5. Click "Connect"
6. Should see: "Connected Wallet: 0x1234...5678"

**Expected:**
- ✓ Wallet address displayed
- ✓ "Connect Wallet" button replaced with form
- ✓ Base chain indicator shown

### **Test 2: Post Task (Testnet)**

1. Connected wallet with test USDC balance
2. Fill in form:
   - Title: "Test task"
   - Description: "Testing wallet integration"
   - Bounty: 0.10 USDC
3. Click "Post Task & Pay"
4. MetaMask confirms transaction
5. Click "Confirm"

**Expected:**
- ✓ MetaMask shows USDC transfer details
- ✓ Gas fee displayed (very low on Base)
- ✓ After confirmation, task appears in list
- ✓ "Payment submitted!" message shown

### **Test 3: Switch Wallet**

1. Post a task with Wallet A
2. In MetaMask, switch to Wallet B
3. Refresh page
4. App should show Wallet B is connected
5. Try posting another task with Wallet B

**Expected:**
- ✓ All tasks visible
- ✓ Only tasks from current wallet show as "yours"
- ✓ Each wallet can post/bid independently

### **Test 4: Wrong Chain Detection**

1. Connected to Base Sepolia
2. In MetaMask, manually switch to Ethereum Mainnet
3. Try to post task
4. App should show warning

**Expected:**
- ✓ Warning: "Please switch to Base network"
- ✓ Button to auto-switch chain
- ✓ Click button → switches back to Base

### **Test 5: Insufficient Balance**

1. Use testnet wallet with 0 USDC balance
2. Try to post task (0.10 USDC)
3. Click "Post Task & Pay"
4. MetaMask shows insufficient balance error

**Expected:**
- ✓ Error message from MetaMask
- ✓ Transaction rejected
- ✓ Task NOT created in database

---

## Troubleshooting

### **Problem: MetaMask not connected**

**Solution:**
1. Check MetaMask is installed and unlocked
2. Check correct network (Base Sepolia or Base Mainnet)
3. Try clicking "Disconnect" then "Connect Wallet" again
4. Clear browser cache and restart

### **Problem: Wrong network error**

**Solution:**
1. MetaMask → Network selector (top-left)
2. Search for "Base Sepolia" (testnet) or "Base" (mainnet)
3. Select it
4. Refresh app

### **Problem: USDC balance shows 0**

**Solution:**
1. You're on the right network
2. Need to get test USDC from faucet
3. Go to https://faucet.circle.com
4. Select Base Sepolia
5. Paste your address
6. Wait ~1 minute
7. Refresh app

### **Problem: Transaction fails with "insufficient funds"**

**Solution:**
1. Testnet USDC balance too low
2. Get more test USDC from faucet
3. Or use different testnet wallet
4. Or reduce bounty amount

### **Problem: App won't connect to Base**

**Solution:**
1. Base chain may be down (rare)
2. Check: https://status.base.org
3. Try switching manually in MetaMask
4. Restart MetaMask extension

---

## Technical Implementation Details

### **Wallet Setup: Providers.tsx**

```typescript
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';

const config = createConfig({
  chains: [base],           // Only connect to Base
  connectors: [injected()], // MetaMask, Coinbase Wallet, etc.
  transports: {
    [base.id]: http(),      // RPC endpoint for Base
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### **Connection Logic: PostTask.tsx**

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function PostTask() {
  // Get wallet state
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Connect wallet
  const handleConnect = () => {
    connect({ connector: injected() });
  };

  // Disconnect
  const handleDisconnect = () => {
    disconnect();
  };

  // Validate chain
  if (isConnected && chainId !== 8453) {
    switchChain({ chainId: 8453 });
  }

  return (
    <>
      {!isConnected ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
        </>
      )}
    </>
  );
}
```

### **Contract Interaction: USDC Transfer**

```typescript
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b1566469c18';
const USDC_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const { writeContract } = useWriteContract();

// Send USDC
const amount = parseUnits('0.30', 6); // USDC has 6 decimals

writeContract({
  address: USDC_ADDRESS,
  abi: USDC_ABI,
  functionName: 'transfer',
  args: [treasuryWallet, amount],
});
```

### **Transaction Flow**

1. **Prepare transaction** (frontend)
   - Amount: 0.30 USDC
   - Recipient: Treasury wallet
   - Chain: Base (8453)

2. **MetaMask signs** (user approves)
   - User sees confirmation popup
   - User clicks "Confirm"

3. **Send to blockchain** (Wagmi/Viem)
   - Sends signed transaction to Base RPC
   - Returns transaction hash

4. **Wait for confirmation** (blockchain)
   - Miners/validators process transaction
   - Transaction included in block
   - Confirmation received

5. **Update app state** (callback)
   - `onSuccess` fired with tx hash
   - Create task in database
   - Show success message

### **State Management**

```typescript
const [mounted, setMounted] = useState(false);
const [title, setTitle] = useState('');
const [bounty, setBounty] = useState('0.30');
const [loading, setLoading] = useState(false);
const [paymentTx, setPaymentTx] = useState<string | null>(null);

// Hydration safety
useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return <LoadingState />;
```

---

## Key Files

| File | Purpose |
|------|---------|
| `components/Providers.tsx` | Wagmi configuration & setup |
| `components/PostTask.tsx` | Post task with USDC payment |
| `components/BidForm.tsx` | Submit bid with wallet |
| `components/Header.tsx` | Display connected wallet |
| `app/api/tasks/*/route.ts` | Backend task endpoints |
| `lib/supabase.ts` | Database client |
| `lib/x402.ts` | Payment utilities |

---

## Network Reference

### **Base Mainnet** (Production)
```
Network: Base
Chain ID: 8453
RPC: https://base.publicrpc.com
USDC Token: 0x833589fcd6edb6e08f4c7c32d4f71b1566469c18
Block Explorer: https://basescan.org
```

### **Base Sepolia** (Testnet)
```
Network: Base Sepolia
Chain ID: 84532
RPC: https://sepolia.base.org
USDC Token: 0x036CbD53842c5426634e7929541eC2cBA24954C
Faucet: https://faucet.circle.com
Block Explorer: https://sepolia.basescan.org
```

---

## Security Considerations

### ✅ What We Do Right

1. **Checksum addresses** - Prevent typos in wallet addresses
2. **Type-safe viem** - Type-safe contract interactions
3. **Chain verification** - Only allow Base chain
4. **Testnet for dev** - Never use mainnet credentials in code
5. **User control** - Only MetaMask can approve transactions

### ⚠️ What to Know

1. **User responsible** - Users approve all transactions
2. **No hidden transfers** - Users see amount before confirming
3. **Public blockchain** - All transactions visible on explorer
4. **Wallet security** - MetaMask security is up to user

---

## Next Steps

1. **Set up testnet wallet:**
   - Install MetaMask
   - Add Base Sepolia
   - Get test USDC from faucet

2. **Test the app:**
   - Connect wallet
   - Post a task
   - Check Supabase dashboard
   - Switch wallets and bid

3. **Explore smart contracts:**
   - View USDC transfers: https://sepolia.basescan.org
   - Search for treasury wallet
   - See actual transactions

4. **Production deployment:**
   - Switch to Base Mainnet
   - Deploy to Vercel
   - Add real USDC liquidity to treasury
