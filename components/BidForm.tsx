'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Bot, CheckCircle, AlertCircle } from 'lucide-react';

interface BidFormProps {
  taskId: string;
  taskTitle: string;
  bountyUsd: number;
  onBidSubmitted?: () => void;
}

export default function BidForm({ taskId, taskTitle, bountyUsd, onBidSubmitted }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState(Math.max(0.01, bountyUsd * 0.8).toFixed(2));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { address, isConnected } = useAccount();

  const handleBid = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (amount <= 0 || amount > bountyUsd) {
      alert(`Bid must be between $0.01 and $${bountyUsd}`);
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const response = await fetch(`/api/tasks/${taskId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_wallet: address,
          bid_amount_usdc: amount,
          execution_metadata: {
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(data.error || 'Failed to submit bid');
        return;
      }

      setStatus('success');
      setMessage(data.message);
      setBidAmount(Math.max(0.01, bountyUsd * 0.8).toFixed(2));

      if (onBidSubmitted) {
        setTimeout(onBidSubmitted, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Error submitting bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-lg border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5" />
        Place Your Bid
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted mb-2">Task: {taskTitle}</p>
          <p className="text-sm text-green-400 font-semibold mb-4">
            Max Bounty: ${bountyUsd} USDC
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            Your Bid (USDC)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={bountyUsd}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              disabled={!isConnected || loading}
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            <span className="text-muted font-semibold">USDC</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            You profit: ${(bountyUsd - parseFloat(bidAmount)).toFixed(2)} USDC
          </p>
        </div>

        {status === 'success' && (
          <div className="p-3 bg-green-900/20 border border-green-700/50 rounded text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400 font-semibold">{message}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 bg-red-900/20 border border-red-700/50 rounded text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 font-semibold">{message}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleBid}
          disabled={!isConnected || loading}
          className="btn-primary w-full"
        >
          {loading ? 'Submitting Bid...' : 'Submit Bid'}
        </button>

        {!isConnected && (
          <p className="text-xs text-slate-400 text-center">
            Connect your wallet to bid on tasks
          </p>
        )}
      </div>
    </div>
  );
}
