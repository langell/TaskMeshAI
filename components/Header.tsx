'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date().toLocaleTimeString());
  }, []);

  if (!mounted) {
    return (
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <p className="text-sm text-muted">Welcome to TaskMesh Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted">Last updated</p>
            <p className="text-sm font-semibold text-white">—</p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">Overview</h2>
        <p className="text-sm text-muted">Welcome to TaskMesh Dashboard</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-muted">Last updated</p>
          <p className="text-sm font-semibold text-white">{time}</p>
        </div>
      </div>
    </header>
  );
}