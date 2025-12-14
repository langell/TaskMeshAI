import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Ganache default account private key (first account)
const GANACHE_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb476c6b8d6c1f02d4b1f9c5b4fc6';

// Simple ERC20 contract bytecode and ABI for deployment
const ERC20_BYTECODE = `6080604052348015600e575f80fd5b50604051611f7d380380611f7d833981016040819052602b91602e565b6050565b5f60208284031215603d575f80fd5b81516001600160a01b0381168114603f575f80fd5b9392505050565b611f1f8061005e5f395ff3fe608060405234801561000f575f80fd5b50600436106100a4575f3560e01c8063313ce56711610076578063a9059cbb11610050578063a9059cbb14610166578063dd62ed3e14610179578063fca3b5aa1461019f575f80fd5b8063313ce567146101055780639dc29fac1461011457806395d89b411461012a575f80fd5b806306fdde03146100a8578063095ea7b3146100d357806318160ddd146100f657806323b872dd14610101575b5f80fd5b6040805180820182527f554344205465737420546f6b656e000000000000000000000000000000000000602082015290519081900360400190f35b6100e66100e1366004611dc3565b6101af565b60405190151581526020015b60405180910390f35b6002545b6040519081526020016100ed565b6100e6610101366004611de0565b6101e3565b604051601281526020016100ed565b610127610122366004611dc3565b610283565b005b6040805180820182527f55534443000000000000000000000000000000000000000000000000000000006020820152905190819003604001905f80fd5b6100e6610174366004611dc3565b610319565b6100fa610187366004611e1f565b6001600160a01b039182165f9081526001602090815260408083209390941682529190915220549050565b6101276101ad366004611e50565b5050565b335f8181526001602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92590610234908690859060208082528581015190850152604090820151906050015b60405180910390a35060015b92915050565b6001600160a01b03821661029f5760405162461bcd60e51b815260040161029690611e7a565b60405180910390fd5b6001600160a01b0383165f9081526001602090815260408083209390931682529190915220548181101561030c5760405162461bcd60e51b815260040161029690611ea6565b5050506001600160a01b03909116905050565b335f908152600160209081526040808320600160a01b54808552825280832060a4820192909355338452919301600a01600601906101af565b5f805460010180825560025461010090910482015550565b801561044d573031606090811b179052505050505050505050565b6040516102f79061011981536020820151600c80850192939193919050565b6040516102f790611b4a81536020820151600c80850192939193919050565b80158015906104405750600160a01b5461044081601054111590565b505050565b336001600160a01b038216145050565b50565b6001600160a01b0381166104605750565b3033036104865761033a81600f80843030166103393034116060008311156060008311156060008311156104895050505050505050565b5050505050505050565b56fea2646970667358221220a2a1d46c8e7b2c0c0efdfdcb0f0d0c0b0a09080706050403020100ffedc5b2640`;

const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'initialSupply', type: 'uint256' },
      { internalType: 'address', name: 'owner', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
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
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'account', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function deployMockUSDC() {
  const rpcUrl = 'http://localhost:8545';

  // Create account from private key
  const account = privateKeyToAccount(GANACHE_PRIVATE_KEY);

  // Create wallet client
  const walletClient = createWalletClient({
    account,
    chain: {
      id: 1337,
      name: 'Ganache',
      network: 'ganache',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] } },
    },
    transport: http(rpcUrl),
  });

  try {
    console.log('🚀 Deploying Mock USDC to Ganache...');
    console.log(`📍 Deployer: ${account.address}`);

    // Deploy contract using eth_sendTransaction
    const hash = await walletClient.deployContract({
      abi: ERC20_ABI as any,
      bytecode: ERC20_BYTECODE as `0x${string}`,
      args: [
        BigInt(1000000 * 1e6), // 1 million USDC (6 decimals)
        account.address, // owner
      ],
    });

    console.log(`✅ Deployment tx hash: ${hash}`);

    // Wait for transaction and get receipt
    const publicClient = createPublicClient({
      chain: {
        id: 1337,
        name: 'Ganache',
        network: 'ganache',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [rpcUrl] } },
      },
      transport: http(rpcUrl),
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt && receipt.contractAddress) {
      console.log(`\n✨ Mock USDC deployed successfully!`);
      console.log(`📝 Contract Address: ${receipt.contractAddress}`);
      console.log(`\n📌 Update your .env.local with:`);
      console.log(`NEXT_PUBLIC_USDC_ADDRESS=${receipt.contractAddress}`);
      return receipt.contractAddress;
    } else {
      console.error('❌ Failed to get contract address from receipt');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployMockUSDC();
