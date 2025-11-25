# Wallet Quick Reference

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install MetaMask
# Download from: https://metamask.io/download/

# 2. Setup Testnet
# - Open MetaMask
# - Network dropdown → Show test networks → Base Sepolia
# - Get test USDC from faucet.circle.com

# 3. Start app
pnpm dev

# 4. Open in browser
# http://localhost:3000

# 5. Click "Connect Wallet" → Test!
```

---

## 🔗 Connection States

| State | What to Do |
|-------|-----------|
| `!isConnected` | Show "Connect Wallet" button |
| `isConnected && chainId !== 8453` | Show "Switch to Base" warning |
| `isConnected && chainId === 8453` | Show form, ready to post/bid |

---

## 💰 USDC on Base

### Mainnet (Production)
- **Chain ID:** 8453
- **Token:** `0x833589fcd6edb6e08f4c7c32d4f71b1566469c18`
- **Decimals:** 6
- **Supply:** Real USDC

### Sepolia (Testing)
- **Chain ID:** 84532
- **Token:** `0x036CbD53842c5426634e7929541eC2cBA24954C`
- **Decimals:** 6
- **Faucet:** https://faucet.circle.com
- **Supply:** Test USDC (free)

---

## 📝 Common Tasks

### Connect Wallet
```typescript
import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const { connect } = useConnect();

connect({ connector: injected() });
```

### Get Wallet State
```typescript
import { useAccount } from 'wagmi';

const { address, isConnected, chainId } = useAccount();

// address: "0x1234..." or undefined
// isConnected: true/false
// chainId: 8453 (Base) or other
```

### Switch Chain
```typescript
import { useSwitchChain } from 'wagmi';

const { switchChain } = useSwitchChain();

switchChain({ chainId: 8453 });
```

### Send USDC
```typescript
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';

const { writeContract } = useWriteContract();

writeContract({
  address: '0x833589fcd6edb6e08f4c7c32d4f71b1566469c18',
  abi: USDC_ABI,
  functionName: 'transfer',
  args: [recipientAddress, parseUnits('0.30', 6)],
});
```

### Check Balance
```typescript
import { useBalance } from 'wagmi';

const { data: balance } = useBalance({
  address: userAddress,
  token: '0x833589fcd6edb6e08f4c7c32d4f71b1566469c18',
});

// balance?.value: BigInt
// balance?.formatted: string
```

---

## 🧪 Testing Without Real Tokens

1. **Add Base Sepolia to MetaMask**
   - Network dropdown → Show test networks → Base Sepolia

2. **Get test USDC**
   - Go to https://faucet.circle.com
   - Select "Base Sepolia"
   - Paste address
   - Wait ~1 minute

3. **Transactions are free**
   - Gas is <$0.01
   - No real money spent

4. **Use multiple wallets**
   - MetaMask → Create new wallet for each test
   - Each gets its own test USDC balance

---

## 🐛 Debugging

### DevTools Console
```typescript
// Check wallet state
> $wagmi
// Shows all Wagmi hooks state

// Check transactions
> window.localStorage
// Find MetaMask transaction history
```

### MetaMask Logs
- **Activity tab** - See all transactions
- **Network indicator** - Verify current network (Base Sepolia)
- **Accounts tab** - Check account balance

### Common Errors

| Error | Fix |
|-------|-----|
| `ChainMismatchError` | Switch to Base (8453) in MetaMask |
| `InsufficientFunds` | Get more test USDC from faucet |
| `Rejected by user` | User clicked Reject in MetaMask |
| `Wrong network` | MetaMask not on Base |

---

## 📊 Transaction Flow

```
User clicks "Post Task"
    ↓
App validates form
    ↓
writeContract() called
    ↓
MetaMask popup appears
    ↓
User clicks "Confirm"
    ↓
Transaction sent to Base
    ↓
Wagmi onSuccess callback
    ↓
Task created in Supabase
    ↓
Task appears in list
```

---

## 🔐 Security Checklist

- [ ] Using testnet for development (not mainnet)
- [ ] Never storing private keys in code
- [ ] Using wagmi checksummed addresses
- [ ] Validating user input before sending
- [ ] Checking chainId before posting/bidding
- [ ] Clearing sensitive data after transactions

---

## 📚 Full Documentation

See detailed guides in `docs/`:
- **WALLET_GUIDE.md** - Complete architecture and implementation
- **WALLET_TESTING_CHECKLIST.md** - Step-by-step testing procedures
- **SUPABASE_SETUP.md** - Database integration

## 🚀 Next Steps

1. Set up testnet wallet
2. Get test USDC
3. Run through testing checklist
4. Post a test task
5. Place a test bid
6. Check data in Supabase
7. Explore Base Sepolia explorer
