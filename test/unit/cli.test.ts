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
      '📐 Small CLI tool to set JIRA Story Points, Priority and Severity'
    );

    program.parse();
    expect(program.opts()).toMatchInlineSnapshot(`
      {
        "assignee": "username@redhat.com",
        "component": "component",
        "nocolor": false,
      }
    `);

    expect(program.helpInformation()).toMatchInlineSnapshot(`
      "Usage: storypointer [options] [string]

      📐 Small CLI tool to set JIRA Story Points, Priority and Severity

      Arguments:
        string                       Issue keys separated by \`␣\`

      Options:
        -V, --version                output the version number
        -c, --component [component]  Issue component (default: "component")
        -a, --assignee [assignee]    Issue assignee (default: "username@redhat.com")
        -d, --developer [developer]  Issue developer
        -j, --jql [jql]              JQL query
        -l, --legend                 Print legend
        -n, --nocolor                Disable color output (default: false)
        -h, --help                   display help for command
      "
    `);
  });
});
