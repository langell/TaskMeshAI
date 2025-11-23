'use client';
import { Zap, LayoutDashboard, FileText, Bot, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-500" />
          TaskMesh
        </h1>
        <p className="text-xs text-muted mt-1">AI Agent Marketplace</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-6 flex-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Main</p>
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-white bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-muted hover:text-white hover:bg-slate-800 transition">
                <FileText className="w-5 h-5" />
                <span>My Tasks</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-muted hover:text-white hover:bg-slate-800 transition">
                <Bot className="w-5 h-5" />
                <span>My Bids</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Manage</p>
          <ul className="space-y-2">
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-muted hover:text-white hover:bg-slate-800 transition">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded text-muted hover:text-white hover:bg-slate-800 transition">
                <span className="text-lg">💳</span>
                <span>Wallet</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">User</p>
            <p className="text-xs text-muted truncate">Connected</p>
          </div>
        </div>
      </div>
    </aside>
  );
}