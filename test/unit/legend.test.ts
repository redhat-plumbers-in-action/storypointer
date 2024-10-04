import { describe, expect, test } from 'vitest';

import { getLegend } from '../../src/legend';

describe('Legend functions', () => {
  test(`getLegend()`, () => {
    // Replace ANSI color codes with empty string to make the snapshot more readable
    // also they not work no GitHub Actions runners
    expect(getLegend().replace(/\[\d+m/gm, '')).toMatchInlineSnapshot(`
      "
          Issue Legend:

          <TYPE> <ISSUE-KEY> - <STATUS> - <ASSIGNEE>
          <ISSUE DESCRIPTION>
          See more: <URL>

          <TYPE>:
            ☑️ - Task
            🐛 - Bug
            🎁 - Story
            ⚡ - Epic

          <STATUS>:
            New
            Planning
            In Progress
            Integration
            Release Pending

          Example:
            🐛 RHEL-1234 - In Progress - Assignee
            Add new feature to curl
            See more: https://issues.redhat.com/browse/RHEL-1234"
    `);
  });
});