import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { cli } from '../../src/cli';

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

describe('CLI functions', () => {
  beforeEach(async () => {
    mocks.os.userInfo.mockReturnValue({
      username: 'username',
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test(`cli()`, () => {
    vi.stubEnv('COMPONENT', 'component');

    const program = cli();

    expect(program.name()).toBe('storypointer');
    expect(program.description()).toBe(
      '📐 Small CLI tool to set JIRA Story Points and Priority '
    );

    program.parse();
    expect(program.opts()).toMatchInlineSnapshot(`
      {
        "assignee": "username@redhat.com",
        "component": "component",
      }
    `);

    expect(program.helpInformation()).toMatchInlineSnapshot(`
      "Usage: storypointer [options] [string]

      📐 Small CLI tool to set JIRA Story Points and Priority

      Arguments:
        string                       Issue keys separated by \`␣\`

      Options:
        -V, --version                output the version number
        -c, --component [component]  Issue component (default: "component")
        -a, --assignee [assignee]    Issue assignee (default: "username@redhat.com")
        -d, --developer [developer]  Issue developer
        -l, --legend                 Print legend
        -h, --help                   display help for command
      "
    `);
  });
});
