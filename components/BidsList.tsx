'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

interface Bid {
  id: string;
  task_id: string;
  agent_wallet: string;
  bid_amount_usdc: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
}

interface BidsListProps {
  taskId: string;
  bountyUsd: number;
  creatorWallet?: string;
  onBidAccepted?: () => void;
}

export default function BidsList({ taskId, bountyUsd, creatorWallet, onBidAccepted }: BidsListProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const { address } = useAccount();
  const isCreator = address?.toLowerCase() === creatorWallet?.toLowerCase();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/bids`);
        if (response.ok) {
          const data = await response.json();
          setBids(data);
        }
      } catch (error) {
        console.error('Error fetching bids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchBids, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleAcceptBid = async (bidId: string) => {
    if (!address) return;

    setAccepting(bidId);
    try {
      const response = await fetch(`/api/tasks/${taskId}/bids/${bidId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creator_wallet: address }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Success: ${data.message}`);
        if (onBidAccepted) {
          onBidAccepted();
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error: any) {
      alert('Error accepting bid: ' + error.message);
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Bids Received
        </h3>
        <p className="text-muted text-sm">Loading bids...</p>
      </div>
    );
  }

  const pendingBids = bids.filter((b) => b.status === 'pending');
  const acceptedBid = bids.find((b) => b.status === 'accepted');
  const rejectedBids = bids.filter((b) => b.status === 'rejected');

  return (
    <div className="bg-card p-4 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Bids Received
        </h3>
        <span className="badge-blue">{bids.length} total</span>
      </div>

      {acceptedBid ? (
        <div className="p-3 bg-green-900/20 border border-green-700/50 rounded mb-4">
          <p className="text-green-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Task Assigned
          </p>
          <p className="text-green-300 text-sm mt-1">
            Agent {acceptedBid.agent_wallet.slice(0, 6)}...{acceptedBid.agent_wallet.slice(-4)} won
            with ${acceptedBid.bid_amount_usdc} USDC bid
          </p>
        </div>
      ) : null}

      {pendingBids.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted font-semibold uppercase mb-3">Pending Bids (lowest price first)</p>
          {pendingBids.map((bid) => (
            <div key={bid.id} className="p-3 bg-slate-800 rounded border border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-semibold">
                  ${bid.bid_amount_usdc} USDC
                </p>
                <p className="text-xs text-muted">
                  {bid.agent_wallet.slice(0, 8)}...{bid.agent_wallet.slice(-6)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Posted {new Date(bid.created_at).toLocaleDateString()}
                </p>
              </div>
              {isCreator && !acceptedBid && (
                <button
                  onClick={() => handleAcceptBid(bid.id)}
                  disabled={accepting === bid.id}
                  className="btn-primary text-sm px-3 py-1"
                >
                  {accepting === bid.id ? 'Accepting...' : '✓ Accept'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted text-sm">
            {acceptedBid ? 'No other bids' : 'No bids yet. Agents will bid soon!'}
          </p>
        </div>
      )}

      {rejectedBids.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Other Bids</p>
          <p className="text-xs text-slate-500">{rejectedBids.length} agent(s) submitted bids</p>
        </div>
      )}
    </div>
  );
}
