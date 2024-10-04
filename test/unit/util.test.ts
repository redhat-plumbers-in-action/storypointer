import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  getOptions,
  getUserFromLogin,
  isDefaultValuesDisabled,
  raise,
  tokenUnavailable,
} from '../../src/util';

const mocks = vi.hoisted(() => {
  return {
    os: {
      userInfo: vi.fn(),
    },
  };
});

vi.mock('node:os', () => {
  return {
    default: mocks.os,
  };
});

describe('Utility functions', () => {
  beforeEach(async () => {
    mocks.os.userInfo.mockReturnValue({
      username: 'username',
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test('raise()', () => {
    expect(() => raise('error')).toThrow('error');
  });

  test('tokenUnavailable()', () => {
    expect(() => tokenUnavailable()).toThrowErrorMatchingInlineSnapshot(`
      [Error: JIRA_API_TOKEN not set.
      Please set the JIRA_API_TOKEN environment variable in '~/.config/storypointer/.env' or '~/.env.storypointer' or '~/.env.']
    `);
  });

  test(`getUserFromLogin()`, () => {
    expect(getUserFromLogin()).toMatchInlineSnapshot(`"username@redhat.com"`);
  });

  test(`isDefaultValuesDisabled()`, () => {
    expect(isDefaultValuesDisabled()).toBe(false);
    vi.stubEnv('NODEFAULTS', 'true');
    expect(isDefaultValuesDisabled()).toBe(true);
  });

  test(`getOptions()`, () => {
    vi.stubEnv('COMPONENT', 'component');

    expect(getOptions({})).toMatchInlineSnapshot(`
      {
        "assignee": "username@redhat.com",
        "component": "component",
        "developer": undefined,
      }
    `);
  });
});
