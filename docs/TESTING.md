# Testing Documentation

## Overview

TaskMeshAI includes a comprehensive unit test suite with **75 tests** covering critical business logic, API routes, and utility functions.

## Test Coverage

### Current Metrics
- **Statements**: 65.06%
- **Functions**: 90.9%
- **Lines**: 64.58%
- **Branches**: 55.76%

### Coverage by Module
| Module | Statements | Functions | Status |
|--------|-----------|-----------|--------|
| lib/x402.ts | 87.5% | 100% | ⭐ Excellent |
| lib/supabase.ts | 66.66% | 100% | ✅ Good |
| agent/summarizer.ts | 78.94% | 50% | ✅ Good |
| app/api/tasks/open | 66.66% | 100% | ✅ Good |
| app/api/tasks/[id]/bid | 88.88% | 100% | ⭐ Excellent |
| app/api/tasks/[id]/complete | 88.88% | 100% | ⭐ Excellent |
| app/api/tasks/[id]/bids | 56.75% | 100% | ✅ Good |
| app/api/tasks/[id]/bids/[bidId]/accept | 42.85% | 100% | ⚠️ Needs improvement |

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test --watch
```

### Run coverage report
```bash
NODE_ENV=test pnpm exec jest --coverage
```

### Run specific test file
```bash
pnpm test lib/__tests__/x402.test.ts
```

## Test Structure

### Test Files
- `lib/__tests__/x402.test.ts` - Payment configuration and verification
- `lib/__tests__/supabase.test.ts` - Supabase client initialization and queries
- `agent/__tests__/summarizer.test.ts` - Agent task bidding logic
- `app/__tests__/api.test.ts` - API route handlers

### Test Suites

#### Library Tests (lib/)

**x402.test.ts** - 25 tests
- `getFacilitator()` - Credential-based facilitator selection
- `generatePaymentConfig()` - Payment configuration generation with various inputs
- `verifyPayment()` - Transaction hash validation
- Edge cases: empty titles, long strings, decimal amounts, null values

**supabase.test.ts** - 16 tests
- Client initialization
- Query builder methods (select, insert, update, delete)
- Filter operations (eq, neq)
- Ordering and limiting
- Single row queries
- Chain operations

#### Agent Tests (agent/)

**summarizer.test.ts** - 9 tests
- Task fetching from API
- Payment invoice handling (402 status)
- Bid submission
- Task completion scheduling
- Wallet inclusion in requests
- Error handling

#### API Route Tests (app/)

**api.test.ts** - 25 tests organized by endpoint:

**GET /api/tasks/open** (3 tests)
- Returns valid JSON response
- Returns array or error object
- Handles database errors

**POST /api/tasks/[id]/bids** (8 tests)
- Accepts valid bids
- Rejects missing fields
- Validates wallet address
- Tests various bid amounts (1, 50, 100, 1000, 10000)
- Returns JSON response

**GET /api/tasks/[id]/bids** (3 tests)
- Returns bids for task
- Returns array response
- Includes proper headers

**POST /api/tasks/[id]/bids/[bidId]/accept** (11 tests)
- Validates creator_wallet requirement
- Accepts valid requests
- Handles different bid/task ID formats
- Case-insensitive wallet comparison
- JSON parsing errors
- Null/empty wallet handling
- Long wallet addresses

**POST /api/tasks/[id]/bid** (2 tests)
- Assigns agent to task
- Returns JSON response

**POST /api/tasks/[id]/complete** (2 tests)
- Completes task
- Returns JSON response

**Error Scenarios** (4 tests)
- Invalid JSON in request
- Numeric task IDs
- UUID task IDs
- HTTP status code validation

## Test Configuration

### jest.config.js
```javascript
{
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  collectCoverageFrom: [
    'agent/**/*.ts',
    'app/api/**/*.ts',
    'lib/**/*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}
```

### Excluded from Coverage
- React components (`components/`)
- Database migrations (`database/`)
- Page layouts (`app/layout.tsx`, `app/page.tsx`)
- CSS files (`app/global.css`)
- Static assets (`public/`)

## Mocking Strategy

### External Dependencies
- **@supabase/supabase-js** - Mocked with chainable query builder
- **@coinbase/x402** - Mocked facilitator configuration
- **fetch API** - Mocked for agent tests

### Environment Variables (test)
```
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
NEXT_PUBLIC_TREASURY_WALLET=0x0000000000000000000000000000000000000000
CDP_API_KEY_ID=test-key-id
CDP_API_KEY_SECRET=test-key-secret
```

## Known Limitations

### API Route Coverage
Complex routes with multiple database operations (like `accept/route.ts`) have lower statement coverage because:
- Mock Supabase clients return immediately without executing route logic
- Business logic that depends on database responses isn't fully covered
- Recommended: Use integration tests for complete coverage of transaction-like operations

### Solutions
1. **Integration Tests** - Test with real/test Supabase database
2. **Extract Logic** - Move business logic to separate, testable functions
3. **Accept Limitation** - Unit tests excel at input/output validation, not database logic

## Writing New Tests

### Test Template
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Module Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', () => {
    // Arrange
    const input = { /* ... */ };

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toEqual({ /* ... */ });
  });
});
```

### Best Practices
1. **Arrange-Act-Assert** - Organize test code clearly
2. **Single Responsibility** - One assertion per test concept
3. **Descriptive Names** - Use "should..." naming convention
4. **Mock External Dependencies** - Isolate code under test
5. **Test Edge Cases** - Empty values, null, negative numbers, etc.

## Continuous Integration

Tests should be run in CI/CD pipeline:
```bash
# Pre-commit hook
pnpm test

# Pre-push hook
NODE_ENV=test pnpm exec jest --coverage
```

## Maintenance

### When to Update Tests
- New features requiring business logic coverage
- Bug fixes that should prevent regression
- API route changes or new endpoints
- Utility function modifications

### Updating Snapshots
```bash
pnpm test -- -u
```

### Debugging Tests
```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand lib/__tests__/x402.test.ts
```

## Performance

Current test suite:
- **Time**: ~0.4 seconds
- **Memory**: Minimal (~50MB)
- **Parallel Execution**: All tests run in parallel

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Jest API Reference](https://jestjs.io/docs/api)
