import '@testing-library/jest-dom';

process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-testing-only-12345678901234567890';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-testing-only-12345678901234567890';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const nodeCrypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => nodeCrypto.randomUUID(),
    subtle: nodeCrypto.webcrypto?.subtle,
  },
  writable: true,
  configurable: true,
});

if (typeof globalThis.Response === 'undefined') {
  class MockResponse {
    status: number;
    private body: unknown;

    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }

    async json(): Promise<unknown> {
      return this.body;
    }
  }

  Object.defineProperty(globalThis, 'Response', {
    value: MockResponse,
    writable: true,
    configurable: true,
  });
}

jest.mock('@/lib/db', () => ({
  getDb: jest.fn().mockResolvedValue({
    collection: jest.fn().mockReturnValue({
      insertOne: jest.fn().mockResolvedValue({ acknowledged: true }),
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
            toArray: jest.fn().mockResolvedValue([]),
          }),
          toArray: jest.fn().mockResolvedValue([]),
        }),
        toArray: jest.fn().mockResolvedValue([]),
      }),
      countDocuments: jest.fn().mockResolvedValue(0),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    }),
  }),
}));
