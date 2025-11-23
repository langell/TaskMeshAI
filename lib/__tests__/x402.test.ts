import { getFacilitator, generatePaymentConfig, verifyPayment, facilitator } from '../x402';
import * as x402Module from '@coinbase/x402';

jest.mock('@coinbase/x402', () => ({
  createFacilitatorConfig: jest.fn(() => ({ type: 'custom_facilitator' })),
  facilitator: { type: 'default_facilitator' },
}));

describe('x402', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getFacilitator', () => {
    it('should return custom facilitator when credentials are provided', () => {
      process.env.CDP_API_KEY_ID = 'test-key-id';
      process.env.CDP_API_KEY_SECRET = 'test-secret';

      const result = getFacilitator();
      expect(result).toEqual({ type: 'custom_facilitator' });
    });

    it('should return default facilitator when credentials are missing', () => {
      delete process.env.CDP_API_KEY_ID;
      delete process.env.CDP_API_KEY_SECRET;

      const result = getFacilitator();
      expect(result).toEqual({ type: 'default_facilitator' });
    });

    it('should return default facilitator when only key ID is provided', () => {
      process.env.CDP_API_KEY_ID = 'test-key-id';
      delete process.env.CDP_API_KEY_SECRET;

      const result = getFacilitator();
      expect(result).toEqual({ type: 'default_facilitator' });
    });

    it('should return default facilitator when only secret is provided', () => {
      delete process.env.CDP_API_KEY_ID;
      process.env.CDP_API_KEY_SECRET = 'test-secret';

      const result = getFacilitator();
      expect(result).toEqual({ type: 'default_facilitator' });
    });
  });

  describe('generatePaymentConfig', () => {
    it('should generate payment config with provided parameters', () => {
      const config = generatePaymentConfig('Build API', 100, '0x123');
      expect(config).toEqual({
        amount: 100,
        recipientAddress: '0x123',
        chainId: 8453,
        description: 'TaskMesh Task: Build API',
      });
    });

    it('should use default recipient address when not provided', () => {
      process.env.NEXT_PUBLIC_TREASURY_WALLET = '0xtreasury';
      const config = generatePaymentConfig('Task', 50);
      expect(config.recipientAddress).toBe('0xtreasury');
    });

    it('should use fallback address when env var is not set', () => {
      delete process.env.NEXT_PUBLIC_TREASURY_WALLET;
      const config = generatePaymentConfig('Task', 50);
      expect(config.recipientAddress).toBe('0x0000000000000000000000000000000000000000');
    });

    it('should handle zero bounty', () => {
      const config = generatePaymentConfig('Free Task', 0, '0x123');
      expect(config.amount).toBe(0);
    });

    it('should handle large bounty amounts', () => {
      const config = generatePaymentConfig('Big Task', 10000, '0x123');
      expect(config.amount).toBe(10000);
    });

    it('should include task title in description', () => {
      const config = generatePaymentConfig('Database Design', 250, '0xabc');
      expect(config.description).toContain('Database Design');
    });

    it('should always use Base chain (8453)', () => {
      const config = generatePaymentConfig('Any Task', 100, '0x123');
      expect(config.chainId).toBe(8453);
    });

    it('should handle special characters in task title', () => {
      const config = generatePaymentConfig('Task: API "Design" & QA', 100, '0x123');
      expect(config.description).toContain('Task: API "Design" & QA');
    });

    it('should handle very long task titles', () => {
      const longTitle = 'A'.repeat(1000);
      const config = generatePaymentConfig(longTitle, 100, '0x123');
      expect(config.description).toContain(longTitle);
    });

    it('should handle decimal bounty amounts', () => {
      const config = generatePaymentConfig('Task', 99.99, '0x123');
      expect(config.amount).toBe(99.99);
    });

    it('should handle negative bounty amounts', () => {
      const config = generatePaymentConfig('Task', -50, '0x123');
      expect(config.amount).toBe(-50);
    });

    it('should handle empty task title', () => {
      const config = generatePaymentConfig('', 100, '0x123');
      expect(config.description).toBe('TaskMesh Task: ');
    });
  });

  describe('verifyPayment', () => {
    it('should return true for valid transaction hash', async () => {
      const result = await verifyPayment('0xabcd1234', 100, '0x123');
      expect(result).toBe(true);
    });

    it('should return false for invalid transaction hash format', async () => {
      const result = await verifyPayment('not-a-hash', 100, '0x123');
      expect(result).toBe(false);
    });

    it('should return false for empty transaction hash', async () => {
      const result = await verifyPayment('', 100, '0x123');
      expect(result).toBe(false);
    });

    it('should return true for long valid hash', async () => {
      const longHash = '0x' + 'a'.repeat(64);
      const result = await verifyPayment(longHash, 100, '0x123');
      expect(result).toBe(true);
    });

    it('should handle verification errors gracefully', async () => {
      const result = await verifyPayment(undefined as any, 100, '0x123');
      expect(result).toBe(false);
    });
  });

  describe('facilitator export', () => {
    it('should export default facilitator', () => {
      expect(facilitator).toEqual({ type: 'default_facilitator' });
    });

    it('should have correct facilitator type', () => {
      expect(facilitator).toHaveProperty('type');
    });
  });
});
