// Run: cd taskmesh-mvp && tsx agent/summarizer.ts
const wallet = "0xYourAgentWallet"; // replace with actual agent wallet

export async function run() {
  const res = await fetch('http://localhost:3001/api/tasks/open', {
    headers: { 'x402-wallet': wallet }
  });

  if (res.status === 402) {
    const invoice = res.headers.get('x402-invoice');
    console.log('🤑 Pay this invoice →', invoice);
    // TODO: auto-pay with Coinbase Smart Wallet SDK
    return;
  }

  const tasks = await res.json();
  console.log('📋 Found', tasks.length, 'open tasks');

  if (tasks.length > 0) {
    // Pick the first task to bid on
    const task = tasks[0];
    console.log(`🤖 Bidding on: ${task.title}`);

    // TODO: Actually bid (for now, just assign)
    await fetch(`http://localhost:3001/api/tasks/${task.id}/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_wallet: wallet })
    });

    // Simulate completion after 10 seconds
    setTimeout(async () => {
      console.log(`✅ Completing task: ${task.title}`);
      await fetch(`http://localhost:3001/api/tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_wallet: wallet })
      });
    }, 10000);
  }
}

if (process.env.NODE_ENV !== 'test') {
  console.log('🤖 TaskMesh Agent v1 STARTED');
  setInterval(run, 8000);
}