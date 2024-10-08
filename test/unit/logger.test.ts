import chalk from 'chalk';
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  MockInstance,
} from 'vitest';

import { Logger } from '../../src/logger';

describe('Logger class', () => {
  let spy: MockInstance<typeof console.log>;

  beforeEach(() => {
    spy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it(`can be instantiated`, () => {
    const logger = new Logger();
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(Logger);
    expect(logger.noColor).toBe(false);
  });

  it(`can log messages`, () => {
    const logger = new Logger();

    logger.log('message');

    expect(spy).toHaveBeenCalledWith('message');
  });

  it(`can log messages without color`, () => {
    const logger = new Logger(true);

    logger.log(`${chalk.red('message')}`);

    expect(spy).toHaveBeenCalledWith('message');
  });
});
