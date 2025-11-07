import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import PostTask from '@/components/PostTask';
import TaskList from '@/components/TaskList';

export default function Home() {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Post Task and Task List */}
            <div className="lg:col-span-2 space-y-6">
              <PostTask />
              <TaskList />
            </div>

            {/* Right column - Stats and Activity */}
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">Dashboard Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="stat-value">12</p>
                    <p className="stat-label">Open Tasks</p>
                  </div>
                  <div>
                    <p className="stat-value">8</p>
                    <p className="stat-label">In Progress</p>
                  </div>
                  <div>
                    <p className="stat-value">24.5</p>
                    <p className="stat-label">Total Bounty (USDC)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}