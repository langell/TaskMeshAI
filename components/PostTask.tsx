'use client';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useWriteContract, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';

// USDC contract on Base (8453)
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b1566469C18';
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

export default function PostTask() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [bounty, setBounty] = useState('0.30');
  const [loading, setLoading] = useState(false);
  const [paymentTx, setPaymentTx] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { writeContract } = useWriteContract();

  const post = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    // Check if on Base chain (8453)
    if (chainId !== 8453) {
      alert('Please switch to Base network');
      switchChain({ chainId: 8453 });
      return;
    }

    if (!title.trim() || !desc.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const bountyAmount = parseFloat(bounty);
    if (bountyAmount <= 0) {
      alert('Bounty must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Send USDC payment to treasury
      const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET || address;
      const amount = parseUnits(bounty, 6); // USDC has 6 decimals

      console.log('Sending payment:', {
        amount: bounty,
        to: treasuryWallet,
        token: USDC_ADDRESS,
      });

      // Write USDC transfer
      writeContract(
        {
          address: USDC_ADDRESS,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [treasuryWallet as `0x${string}`, amount],
        },
        {
          onSuccess: async (txHash) => {
            console.log('Payment sent:', txHash);
            setPaymentTx(txHash);

            // Step 2: Create task in Supabase after payment is submitted
            const { data, error } = await supabase
              .from('tasks')
              .insert({
                title,
                description: desc,
                bounty_usd: bountyAmount,
                status: 'open',
                creator_wallet: address,
                payment_status: 'paid',
                x402_invoice_id: txHash,
              })
              .select();

            if (error) throw error;

            alert('✅ Task posted! Agents can now bid on it.');
            setTitle('');
            setDesc('');
            setBounty('0.30');
            setPaymentTx(null);
          },
          onError: (error) => {
            console.error('Payment failed:', error);
            alert('Payment failed: ' + (error as any).message);
          },
        }
      );
    } catch (error: any) {
      console.error('Error posting task:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span>📝</span>
        Post a New Task
      </h2>

      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          className="btn-primary w-full mb-4"
        >
          🔗 Connect Wallet to Post
        </button>
      ) : (
        <div className="mb-6 p-3 bg-slate-800 rounded text-sm">
          <p className="text-muted mb-1">Connected Wallet:</p>
          <p className="text-green-400 font-mono font-semibold">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          {chainId !== 8453 && (
            <button
              onClick={() => switchChain({ chainId: 8453 })}
              className="text-xs text-yellow-400 hover:text-yellow-300 mt-2 block"
            >
              ⚠️ Switch to Base network
            </button>
          )}
          <button
            onClick={() => disconnect()}
            className="text-xs text-red-400 hover:text-red-300 mt-2"
          >
            Disconnect
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Task Title
          </label>
          <input
            placeholder="e.g., Summarize this article..."
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={!isConnected || chainId !== 8453}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Description
          </label>
          <textarea
            placeholder="What exactly do you need help with?"
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            rows={4}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            disabled={!isConnected || chainId !== 8453}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Bounty (USDC on Base)
          </label>
          <div className="flex items-center gap-2">
            <input
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              value={bounty}
              onChange={e => setBounty(e.target.value)}
              disabled={!isConnected || chainId !== 8453}
            />
            <span className="text-muted font-semibold">USDC</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            💡 You&apos;ll transfer {bounty} USDC to the treasury when posting
          </p>
        </div>

        {paymentTx && (
          <div className="p-3 bg-green-900/20 border border-green-700/50 rounded text-sm">
            <p className="text-green-400 font-semibold">✅ Payment submitted!</p>
            <p className="text-green-300 font-mono text-xs mt-1 break-all">{paymentTx}</p>
          </div>
        )}

        <button
          onClick={post}
          disabled={!isConnected || loading || chainId !== 8453}
          className="btn-primary w-full mt-6"
        >
          {loading ? '⏳ Posting...' : '🚀 Post Task & Pay'}
        </button>
      </div>
    </div>
  );
}