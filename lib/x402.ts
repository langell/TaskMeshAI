import { createFacilitatorConfig, facilitator as defaultFacilitator } from '@coinbase/x402';

/**
 * Get x402 facilitator config for payment verification
 * Uses Coinbase's hosted facilitator service
 */
export function getFacilitator() {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;

  if (apiKeyId && apiKeySecret) {
    return createFacilitatorConfig(apiKeyId, apiKeySecret);
  }
  
  // Fallback to default (works for list endpoint without auth)
  return defaultFacilitator;
}

/**
 * Payment configuration for a task
 * In production, this would be used with x402 or similar payment protocol
 * For MVP, we track payment through the database and wallet signatures
 */
export interface PaymentConfig {
  amount: number; // In USD
  recipientAddress: string; // TaskMesh contract or treasury wallet
  chainId: number; // Base chain (8453)
  description: string;
}

/**
 * Generate payment config for task posting
 */
export function generatePaymentConfig(
  taskTitle: string,
  bountyUsd: number,
  recipientAddress: string = process.env.NEXT_PUBLIC_TREASURY_WALLET || '0x0000000000000000000000000000000000000000'
): PaymentConfig {
  return {
    amount: bountyUsd,
    recipientAddress,
    chainId: 8453, // Base
    description: `TaskMesh Task: ${taskTitle}`,
  };
}

/**
 * Verify payment was made (in production, this would check blockchain)
 * For MVP, the frontend handles wallet signing
 */
export async function verifyPayment(
  transactionHash: string,
  expectedAmount: number,
  expectedRecipient: string
): Promise<boolean> {
  try {
    // In production, this would verify the transaction on-chain
    // For now, we rely on the transactionHash being valid
    // The actual verification would happen when the task is retrieved
    return !!transactionHash && transactionHash.startsWith('0x');
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

export const facilitator = defaultFacilitator;
