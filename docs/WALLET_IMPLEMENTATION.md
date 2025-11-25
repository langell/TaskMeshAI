# Wallet Implementation Guide for Developers

This guide explains how to work with wallet code in TaskMeshAI.

## File Structure

```
components/
├── Providers.tsx          ← Wagmi configuration
├── PostTask.tsx           ← Post task with USDC payment
├── BidForm.tsx            ← Submit bid UI
├── BidsList.tsx           ← Display bids
├── Header.tsx             ← Show wallet connection
└── Sidebar.tsx            ← Navigation

app/api/
├── tasks/open/route.ts    ← List tasks (requires payment)
├── tasks/[id]/
│   ├── bids/route.ts      ← Create bid
│   ├── bid/route.ts       ← Assign agent
│   ├── complete/route.ts  ← Complete task
│   └── [bidId]/accept/route.ts  ← Accept bid

lib/
├── supabase.ts            ← Database client
└── x402.ts                ← Payment utilities
```

---

## 1. Setting Up Wagmi (Providers.tsx)

This file initializes wallet connection globally.

### What It Does

```typescript
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const config = createConfig({
  chains: [base],              // Only connect to Base chain
  connectors: [injected()],    // MetaMask, Coinbase Wallet, etc.
  transports: {
    [base.id]: http(),         // RPC endpoint
  },
});

export function Providers({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### Key Concepts

- **`chains: [base]`** - Only Base chain available. Prevents accidental transfers on wrong chain.
- **`connectors: [injected()]`** - Supports MetaMask, Coinbase Wallet, etc. (anything injected into browser)
- **`http()`** - RPC endpoint. Uses public endpoint by default.

### Why This Setup?

✅ **Single chain** - No accidental cross-chain mistakes  
✅ **Extensible** - Easy to add more chains or connectors later  
✅ **Type-safe** - TypeScript catches issues at compile time  

---

## 2. Connecting Wallet (PostTask.tsx)

Shows how to handle wallet connection and validation.

### Connection Flow

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function PostTask() {
  // Get current wallet state
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Step 1: Check if wallet connected
  if (!isConnected) {
    return (
      <button onClick={() => connect({ connector: injected() })}>
        Connect Wallet
      </button>
    );
  }

  // Step 2: Check if on correct chain
  if (chainId !== 8453) {
    return (
      <button onClick={() => switchChain({ chainId: 8453 })}>
        Switch to Base
      </button>
    );
  }

  // Step 3: Render form
  return <Form />;
}
```

### Key Hooks

| Hook | Returns | Purpose |
|------|---------|---------|
| `useAccount()` | `{ address, isConnected, chainId }` | Get current wallet state |
| `useConnect()` | `{ connect }` | Connect to wallet |
| `useDisconnect()` | `{ disconnect }` | Disconnect wallet |
| `useSwitchChain()` | `{ switchChain }` | Change network |

---

## 3. Sending USDC Payment (PostTask.tsx)

How to transfer USDC when posting a task.

### Contract Setup

```typescript
// USDC contract on Base
const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b1566469c18';

// ERC20 transfer function ABI
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
] as const;
```

### Send Transaction

```typescript
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

export default function PostTask() {
  const { writeContract } = useWriteContract();

  const post = async () => {
    const bounty = '0.30'; // USDC
    const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET;

    // Convert to contract format (USDC has 6 decimals)
    const amount = parseUnits(bounty, 6);

    // Send USDC transfer
    writeContract(
      {
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [treasuryWallet as `0x${string}`, amount],
      },
      {
        onSuccess: async (txHash) => {
          // Transaction submitted successfully
          console.log('Payment sent:', txHash);

          // Create task in database
          const { data } = await supabase
            .from('tasks')
            .insert({
              title,
              bounty_usd: parseFloat(bounty),
              creator_wallet: address,
              payment_status: 'paid',
              x402_invoice_id: txHash,
            });

          alert('Task posted!');
        },
        onError: (error) => {
          // Transaction failed or user rejected
          alert('Error: ' + error.message);
        },
      }
    );
  };

  return <button onClick={post}>Post Task & Pay</button>;
}
```

### Key Details

- **`parseUnits(bounty, 6)`** - USDC has 6 decimals, not 18
- **`as 0x${string}`** - TypeScript type assertion for viem
- **`onSuccess`** - Fires when transaction is mined
- **`onError`** - Fires if transaction fails or is rejected

---

## 4. Reading Wallet State (Header.tsx)

Simple example of displaying wallet info.

```typescript
import { useAccount, useDisconnect } from 'wagmi';

export default function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return <p>Not connected</p>;
  }

  return (
    <div>
      <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
```

---

## 5. Testing Wallet Code

### Unit Tests (Mocking)

```typescript
// app/__tests__/api.test.ts
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
    chainId: 8453,
  }),
  useConnect: () => ({
    connect: jest.fn(),
  }),
}));

describe('PostTask', () => {
  it('should show form when connected', () => {
    const { container } = render(<PostTask />);
    expect(container.textContent).toContain('Post Task');
  });
});
```

### Manual Testing

1. Install MetaMask
2. Add Base Sepolia
3. Get test USDC from faucet
4. Run `pnpm dev`
5. Open http://localhost:3000
6. Connect wallet
7. Post task
8. Approve MetaMask transaction
9. Check Supabase dashboard

---

## 6. Common Patterns

### Pattern: Guard Against Disconnection

```typescript
const { address, isConnected } = useAccount();

const handleBid = async () => {
  if (!isConnected || !address) {
    alert('Please connect wallet first');
    return;
  }
  
  // Safe to use `address` now
  await submitBid(address);
};
```

### Pattern: Validate Before Sending

```typescript
const validateAndPost = async () => {
  // Validate form
  if (!title || !description) {
    alert('Fill in all fields');
    return;
  }

  // Validate amount
  if (bounty <= 0) {
    alert('Bounty must be > 0');
    return;
  }

  // Validate chain
  if (chainId !== 8453) {
    alert('Wrong chain');
    return;
  }

  // Now safe to proceed
  await post();
};
```

### Pattern: Hydration Safety

```typescript
import { useEffect, useState } from 'react';

export default function Component() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return <Loading />;

  return <div>{address}</div>;
}
```

---

## 7. Error Handling

### Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| `ChainMismatchError` | User on wrong chain | Call `switchChain({ chainId: 8453 })` |
| `UserRejectedRequest` | User clicked reject | Show message, let user retry |
| `InsufficientFunds` | Not enough USDC | Show balance, suggest faucet |
| `ContractFunctionExecutionError` | Invalid contract call | Check ABI and addresses |
| `InvalidAddressError` | Bad address format | Use viem's checksumAddress |

### Error Handling Example

```typescript
try {
  writeContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'transfer',
    args: [to, amount],
  });
} catch (error) {
  if (error instanceof ChainMismatchError) {
    await switchChain({ chainId: 8453 });
  } else if (error instanceof UserRejectedRequest) {
    console.log('User rejected');
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## 8. Gas & Costs

### Base Chain Gas

- **Average gas:** 21,000 units
- **Gas price:** ~0.5 GWEI
- **Cost:** ~$0.01 USD

### USDC Transfer

- **Gas used:** ~65,000 units
- **Cost:** ~$0.03 USD
- **Speed:** 2 seconds average

### Testnet

- **Gas cost:** $0.00 (free test USDC)
- **Speed:** Same as mainnet
- **No real money:** All free for development

---

## 9. Security Best Practices

### ✅ Do

- [ ] Always validate chain ID before transactions
- [ ] Use viem for type safety
- [ ] Check user balance before posting
- [ ] Verify recipient address matches environment
- [ ] Log transaction hashes for debugging
- [ ] Show clear error messages to users

### ❌ Don't

- [ ] Store private keys in frontend code
- [ ] Use hardcoded wallet addresses
- [ ] Skip chain validation
- [ ] Trust user input without validation
- [ ] Send transactions without user confirmation
- [ ] Log sensitive data to console

---

## 10. Extending for New Features

### Add New Token

```typescript
const CUSTOM_TOKEN_ADDRESS = '0x...';
const CUSTOM_TOKEN_ABI = [...];

writeContract({
  address: CUSTOM_TOKEN_ADDRESS,
  abi: CUSTOM_TOKEN_ABI,
  functionName: 'transfer',
  args: [to, amount],
});
```

### Add New Chain

```typescript
// In Providers.tsx
import { base, mainnet } from 'wagmi/chains';

const config = createConfig({
  chains: [base, mainnet], // Add mainnet
  // ...
});
```

### Add Signature Verification

```typescript
import { useSignMessage } from 'wagmi';

const { signMessage } = useSignMessage();

signMessage(
  { message: 'Sign this to verify ownership' },
  {
    onSuccess: (signature) => {
      // Signature verified
      console.log(signature);
    },
  }
);
```

---

## Debugging Tips

### Check Wallet State

```javascript
// In browser console
wagmi.useAccount()
// Returns current state
```

### View Transactions

```javascript
// MetaMask → Activity tab → See all transactions
// Or: https://sepolia.basescan.org (testnet explorer)
```

### Monitor Network Requests

```javascript
// DevTools → Network tab
// Filter by "base" to see blockchain requests
```

### Check Contract Calls

```javascript
// Etherscan for mainnet: https://basescan.org
// Testnet explorer: https://sepolia.basescan.org
// Search for transaction hash
```

---

## Resources

- **Wagmi Docs:** https://wagmi.sh/
- **Viem Docs:** https://viem.sh/
- **Base Docs:** https://docs.base.org/
- **USDC on Base:** https://www.circle.com/
- **MetaMask Docs:** https://docs.metamask.io/

---

## Next Steps

1. Read WALLET_GUIDE.md for architecture overview
2. Follow WALLET_TESTING_CHECKLIST.md to test manually
3. Modify PostTask.tsx component for your use case
4. Test with testnet USDC
5. Deploy to production when ready

Happy coding! 🚀
