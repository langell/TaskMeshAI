'use client';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

const statusColors: Record<string, string> = {
  open: 'badge-blue',
  in_progress: 'badge-green',
  completed: 'badge-green',
  cancelled: 'badge-red',
};

const statusIcons: Record<string, string> = {
  open: '🔵',
  in_progress: '🟡',
  completed: '✅',
  cancelled: '❌',
};

export default function TaskList() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('tasks').select('*').order('created_at', { ascending: false }).then(({ data }) => setTasks(data || []));
    const channel = supabase.channel('tasks').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      supabase.from('tasks').select('*').then(({ data }) => setTasks(data || []));
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="bg-card p-6 rounded-lg">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <span>📋</span>
        Open Tasks
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-muted">No tasks yet — be the first to post one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(t => (
            <div
              key={t.id}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-4 transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{t.title}</h3>
                  <p className="text-sm text-muted line-clamp-2">{t.description}</p>
                </div>
                <span className={`badge ${statusColors[t.status] || 'badge-blue'}`}>
                  {statusIcons[t.status]} {t.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <div>
                    <p className="text-muted">Bounty</p>
                    <p className="text-green-400 font-semibold">${t.bounty_usd} USDC</p>
                  </div>
                  {t.agent_wallet && (
                    <div>
                      <p className="text-muted">Agent</p>
                      <p className="text-blue-400 font-mono">{t.agent_wallet.slice(0, 6)}...{t.agent_wallet.slice(-4)}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted">
                  {new Date(t.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}