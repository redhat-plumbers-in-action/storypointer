import { describe, expect, test } from 'vitest';

import { raise } from '../../src/util';

describe('Utility functions', () => {
  test('raise()', () => {
    expect(() => raise('error')).toThrow('error');
  });
});
