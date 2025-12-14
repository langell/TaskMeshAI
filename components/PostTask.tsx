'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useSwitchChain, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { CheckCircle, FileText, Lightbulb, Send } from 'lucide-react';

// Using native ETH for payments during testing
// TODO: Switch to USDC after deploying token contract

export default function PostTask() {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [bounty, setBounty] = useState('0.30');
  const [loading, setLoading] = useState(false);
  const [paymentTx, setPaymentTx] = useState<`0x${string}` | undefined>(undefined);
  const [pendingTask, setPendingTask] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { sendTransaction, isPending, data: txHash } = useSendTransaction();
  
  // Watch for transaction receipt to know when it's confirmed
  const { data: receipt, status: txStatus } = useWaitForTransactionReceipt({
    hash: paymentTx || undefined,
  });

  // When writeContract succeeds, update paymentTx
  useEffect(() => {
    if (txHash) {
      setPaymentTx(txHash);
    }
  }, [txHash]);

  // Handle transaction confirmation
  useEffect(() => {
    if (receipt && txStatus === 'success' && paymentTx && pendingTask) {
      const submitTaskToDb = async () => {
        try {
          // Create task in Supabase after payment is confirmed
          const { data, error } = await supabase
            .from('tasks')
            .insert({
              title: pendingTask.title,
              description: pendingTask.desc,
              bounty_usd: pendingTask.bountyAmount,
              status: 'open',
              creator_wallet: address,
              payment_status: 'paid',
              x402_invoice_id: paymentTx,
            })
            .select();

          if (error) throw error;

          alert('Task posted! Agents can now bid on it.');
          setTitle('');
          setDesc('');
          setBounty('0.30');
          setPaymentTx(undefined);
          setPendingTask(null);
          setLoading(false);
        } catch (error: any) {
          console.error('Error creating task:', error);
          alert('Failed to create task: ' + error.message);
          setLoading(false);
        }
      };
      
      submitTaskToDb();
    }
  }, [receipt, txStatus, paymentTx, pendingTask, address]);

  if (!mounted) {
    return (
      <div className="bg-card p-6 rounded-lg">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Post a New Task
        </h2>
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const post = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    // Check if on Base chain (8453), Ganache localhost (1337), or Mainnet (1 - when using Ganache)
    const isValidChain = chainId === 8453 || chainId === 1337 || chainId === 1;
    if (!isValidChain) {
      alert('Please switch to Base network or Ganache localhost');
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
      // Step 1: Send ETH payment to treasury (native token)
      const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET || address;
      const amount = parseEther(bounty); // Parse as ETH

      console.log('Sending payment:', {
        amount: bounty,
        to: treasuryWallet,
        token: 'ETH (native)',
      });

      // Store pending task data
      setPendingTask({ title, desc, bountyAmount });

      // Send native ETH transaction
      sendTransaction({
        to: treasuryWallet as `0x${string}`,
        value: amount,
      });
    } catch (error: any) {
      console.error('Error posting task:', error);
      if (error.message && !error.message.includes('User rejected')) {
        alert('Error: ' + error.message);
      }
      setLoading(false);
      setPendingTask(null);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5" />
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
          <p className="text-xs text-slate-500 mt-1">Chain ID: {chainId}</p>
          {chainId !== 8453 && chainId !== 1337 && chainId !== 1 && chainId !== undefined && (
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
            disabled={!isConnected || (chainId !== 8453 && chainId !== 1337 && chainId !== 1)}
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
            disabled={!isConnected || (chainId !== 8453 && chainId !== 1337 && chainId !== 1)}
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
              disabled={!isConnected || (chainId !== 8453 && chainId !== 1337 && chainId !== 1)}
            />
            <span className="text-muted font-semibold">USDC</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            You'll transfer {bounty} USDC to the treasury when posting
          </p>
        </div>

        {paymentTx && (
          <div className={`p-3 rounded text-sm ${
            txStatus === 'success' 
              ? 'bg-green-900/20 border border-green-700/50' 
              : 'bg-blue-900/20 border border-blue-700/50'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-5 h-5 ${txStatus === 'success' ? 'text-green-400' : 'text-blue-400'}`} />
              <p className={`font-semibold ${txStatus === 'success' ? 'text-green-400' : 'text-blue-400'}`}>
                {txStatus === 'success' ? 'Payment confirmed!' : 'Payment submitted...'}
              </p>
            </div>
            <p className={`font-mono text-xs mt-1 break-all ${txStatus === 'success' ? 'text-green-300' : 'text-blue-300'}`}>
              {paymentTx}
            </p>
          </div>
        )}

        <button
          onClick={post}
          disabled={!isConnected || loading || isPending || (chainId !== 8453 && chainId !== 1337 && chainId !== 1) || !!paymentTx}
          className="btn-primary w-full mt-6"
        >
          {loading || isPending ? 'Posting...' : paymentTx ? 'Waiting for confirmation...' : 'Post Task & Pay'}
        </button>
      </div>
    </div>
  );
}