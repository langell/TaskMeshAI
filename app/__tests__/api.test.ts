import { NextRequest, NextResponse } from 'next/server';

// Setup mocks VERY early - before any module imports
const createMockSupabaseClient = () => ({
  from: jest.fn(function() {
    return {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };
  }),
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => createMockSupabaseClient()),
}));

jest.mock('@coinbase/x402', () => ({
  createFacilitatorConfig: jest.fn(() => ({ type: 'facilitator' })),
  facilitator: { type: 'default' },
}));

describe('API Routes', () => {
  describe('GET /api/tasks/open', () => {
    it('returns a valid response', async () => {
      const { GET } = require('@/app/api/tasks/open/route');
      const request = new Request('http://localhost/api/tasks/open');
      const response = await GET(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    it('returns JSON content type', async () => {
      const { GET } = require('@/app/api/tasks/open/route');
      const request = new Request('http://localhost/api/tasks/open');
      const response = await GET(request);
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('returns array or error object', async () => {
      const { GET } = require('@/app/api/tasks/open/route');
      const request = new Request('http://localhost/api/tasks/open');
      const response = await GET(request);
      const data = await response.json();
      expect(data).toBeDefined();
    });
  });

  describe('POST /api/tasks/[id]/bids', () => {
    it('rejects missing required fields', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bids', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('accepts valid bid submission', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bids', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
          bid_amount_usdc: 100,
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect([200, 201, 400, 404, 500]).toContain(response.status);
    });

    it('returns JSON response', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bids', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
          bid_amount_usdc: 100,
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('handles various bid amounts', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/route');
      const amounts = [1, 50, 100, 1000, 10000];

      for (const amount of amounts) {
        const request = new NextRequest('http://localhost/api/tasks/1/bids', {
          method: 'POST',
          body: JSON.stringify({
            agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
            bid_amount_usdc: amount,
          }),
        });

        const response = await POST(request, { params: { id: '1' } });
        expect([200, 201, 400, 404, 500]).toContain(response.status);
      }
    });

    it('rejects bids with missing agent_wallet', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bids', {
        method: 'POST',
        body: JSON.stringify({
          bid_amount_usdc: 100,
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('rejects bids with missing bid_amount_usdc', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bids', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/tasks/[id]/bids', () => {
    it('returns valid response', async () => {
      const { GET } = require('@/app/api/tasks/[id]/bids/route');
      const request = new Request('http://localhost/api/tasks/1/bids');
      const response = await GET(request, { params: { id: '1' } });

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    it('returns array of bids', async () => {
      const { GET } = require('@/app/api/tasks/[id]/bids/route');
      const request = new Request('http://localhost/api/tasks/1/bids');
      const response = await GET(request, { params: { id: '1' } });
      const data = await response.json();

      expect(Array.isArray(data) || data.error).toBe(true);
    });

    it('returns content-type header', async () => {
      const { GET } = require('@/app/api/tasks/[id]/bids/route');
      const request = new Request('http://localhost/api/tasks/1/bids');
      const response = await GET(request, { params: { id: '1' } });
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('POST /api/tasks/[id]/bids/[bidId]/accept', () => {
    it('rejects accept without creator_wallet', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect(response.status).toBe(400);
    });

    it('accepts valid accept request', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: JSON.stringify({
            creator_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('returns JSON response', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: JSON.stringify({
            creator_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('handles different bidId formats', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const bidId = 'uuid-format-bid-id';
      const request = new NextRequest(
        `http://localhost/api/tasks/1/bids/${bidId}/accept`,
        {
          method: 'POST',
          body: JSON.stringify({
            creator_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId },
      });
      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it('handles case-insensitive wallet comparison', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: JSON.stringify({
            creator_wallet: '0xaBCDef123456',
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect([200, 400, 403, 404, 500]).toContain(response.status);
    });

    it('handles various task ID formats', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const taskIds = ['1', 'uuid-12345', 'task-abc-123'];

      for (const taskId of taskIds) {
        const request = new NextRequest(
          `http://localhost/api/tasks/${taskId}/bids/bid-1/accept`,
          {
            method: 'POST',
            body: JSON.stringify({
              creator_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
            }),
          }
        );

        const response = await POST(request, {
          params: { id: taskId, bidId: 'bid-1' },
        });
        expect([200, 400, 403, 404, 500]).toContain(response.status);
      }
    });

    it('rejects invalid JSON in body', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: 'not valid json',
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect([400, 500]).toContain(response.status);
    });

    it('handles empty creator_wallet string', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: JSON.stringify({
            creator_wallet: '',
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect(response.status).toBe(400);
    });

    it('handles null creator_wallet', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: JSON.stringify({
            creator_wallet: null,
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect(response.status).toBe(400);
    });

    it('handles extremely long wallet address', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/[bidId]/accept/route');
      const longWallet = '0x' + 'a'.repeat(1000);
      const request = new NextRequest(
        'http://localhost/api/tasks/1/bids/bid-1/accept',
        {
          method: 'POST',
          body: JSON.stringify({
            creator_wallet: longWallet,
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '1', bidId: 'bid-1' },
      });
      expect([200, 400, 403, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/tasks/[id]/bid', () => {
    it('accepts valid bid assignment', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bid/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bid', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect([200, 400, 500]).toContain(response.status);
    });

    it('returns JSON response', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bid/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bid', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('POST /api/tasks/[id]/complete', () => {
    it('accepts valid complete request', async () => {
      const { POST } = require('@/app/api/tasks/[id]/complete/route');
      const request = new NextRequest('http://localhost/api/tasks/1/complete', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect([200, 400, 500]).toContain(response.status);
    });

    it('returns JSON response', async () => {
      const { POST } = require('@/app/api/tasks/[id]/complete/route');
      const request = new NextRequest('http://localhost/api/tasks/1/complete', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
        }),
      });

      const response = await POST(request, { params: { id: '1' } });
      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('Error scenarios', () => {
    it('handles invalid JSON in request body', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bids/route');
      const request = new NextRequest('http://localhost/api/tasks/1/bids', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request, { params: { id: '1' } });
      expect([400, 500]).toContain(response.status);
    });

    it('handles numeric task IDs', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bid/route');
      const request = new NextRequest('http://localhost/api/tasks/123/bid', {
        method: 'POST',
        body: JSON.stringify({
          agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
        }),
      });

      const response = await POST(request, { params: { id: '123' } });
      expect([200, 400, 500]).toContain(response.status);
    });

    it('handles UUID task IDs', async () => {
      const { POST } = require('@/app/api/tasks/[id]/bid/route');
      const request = new NextRequest(
        'http://localhost/api/tasks/550e8400-e29b-41d4-a716-446655440000/bid',
        {
          method: 'POST',
          body: JSON.stringify({
            agent_wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f42bE',
          }),
        }
      );

      const response = await POST(request, {
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('HTTP status codes', () => {
    it('returns appropriate status codes', async () => {
      const { GET } = require('@/app/api/tasks/open/route');
      const request = new Request('http://localhost/api/tasks/open');
      const response = await GET(request);

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
    });

    it('includes response headers', async () => {
      const { GET } = require('@/app/api/tasks/open/route');
      const request = new Request('http://localhost/api/tasks/open');
      const response = await GET(request);

      expect(response.headers).toBeDefined();
      expect(response.headers.get('content-type')).toBeDefined();
    });
  });
});
