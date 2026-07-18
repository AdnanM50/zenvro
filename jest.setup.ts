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
