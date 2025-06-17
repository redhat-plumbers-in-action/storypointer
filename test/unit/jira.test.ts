import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Jira } from '../../src/jira';

const mocks = vi.hoisted(() => {
  return {
    getServerInfo: vi.fn(),
    searchForIssuesUsingJqlEnhancedSearchPost: vi.fn(),
    editIssue: vi.fn(),
  };
});

vi.mock('jira.js', () => {
  const Version2Client = vi.fn(function () {
    return {
      serverInfo: {
        getServerInfo: mocks.getServerInfo,
      },
      issueSearch: {
        searchForIssuesUsingJqlEnhancedSearchPost:
          mocks.searchForIssuesUsingJqlEnhancedSearchPost,
      },
      issues: {
        editIssue: mocks.editIssue,
      },
    };
  });
  return {
    Version2Client,
  };
});

describe('Jira functions', () => {
  let jira: Jira;

  beforeEach(() => {
    jira = new Jira('https://issues.redhat.com', 'token');

    mocks.getServerInfo.mockReturnValue({
      version: '8.0.0',
    });

    mocks.searchForIssuesUsingJqlEnhancedSearchPost.mockReturnValue({
      issues: [
        {
          key: 'RHEL-1234',
          fields: {
            issuetype: {
              name: 'Story',
            },
            status: {
              name: 'Open',
            },
            assignee: {
              displayName: 'assignee',
            },
            summary: 'summary',
            [jira.fields.storyPoints]: 3,
            [jira.fields.priority]: {
              name: 'High',
            },
          },
        },
        {
          key: 'RHEL-1235',
          fields: {
            issuetype: {
              name: 'Story',
            },
            status: {
              name: 'Open',
            },
            assignee: {
              displayName: 'assignee',
            },
            summary: 'summary',
            [jira.fields.storyPoints]: 5,
            [jira.fields.priority]: {
              name: 'Low',
            },
          },
        },
      ],
    });

    mocks.editIssue.mockReturnValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('can be instantiated', () => {
    expect(jira).toBeInstanceOf(Jira);
    expect(jira.baseJQL).toMatchInlineSnapshot(
      `"Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed"`
    );
  });

  test('getVersion()', async () => {
    expect(await jira.getVersion()).toMatchInlineSnapshot(`"8.0.0"`);
  });

  test('getIssuesByID()', async () => {
    const issues = await jira.getIssuesByID(['RHEL-1234', 'RHEL-1235']);

    expect(jira.JQL).toMatchInlineSnapshot(
      `"issue in (RHEL-1234,RHEL-1235) ORDER BY id DESC"`
    );
    expect(
      mocks.searchForIssuesUsingJqlEnhancedSearchPost
    ).toHaveBeenCalledWith({
      fields: [
        'id',
        'issuetype',
        'status',
        'components',
        'summary',
        'assignee',
        'customfield_12310243',
        'priority',
      ],
      jql: 'issue in (RHEL-1234,RHEL-1235) ORDER BY id DESC',
    });
    expect(issues).toMatchInlineSnapshot(`
      [
        {
          "fields": {
            "assignee": {
              "displayName": "assignee",
            },
            "customfield_12310243": 3,
            "issuetype": {
              "name": "Story",
            },
            "priority": {
              "name": "High",
            },
            "status": {
              "name": "Open",
            },
            "summary": "summary",
          },
          "key": "RHEL-1234",
        },
        {
          "fields": {
            "assignee": {
              "displayName": "assignee",
            },
            "customfield_12310243": 5,
            "issuetype": {
              "name": "Story",
            },
            "priority": {
              "name": "Low",
            },
            "status": {
              "name": "Open",
            },
            "summary": "summary",
          },
          "key": "RHEL-1235",
        },
      ]
    `);
  });

  test('getIssues()', async () => {
    let issues = await jira.getIssues(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(jira.JQL).toMatchInlineSnapshot(
      `"Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed ORDER BY id DESC"`
    );
    expect(
      mocks.searchForIssuesUsingJqlEnhancedSearchPost
    ).toHaveBeenCalledWith({
      fields: [
        'id',
        'issuetype',
        'status',
        'components',
        'summary',
        'assignee',
        'customfield_12310243',
        'priority',
      ],
      jql: 'Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed ORDER BY id DESC',
    });
    expect(issues).toMatchInlineSnapshot(`
      [
        {
          "fields": {
            "assignee": {
              "displayName": "assignee",
            },
            "customfield_12310243": 3,
            "issuetype": {
              "name": "Story",
            },
            "priority": {
              "name": "High",
            },
            "status": {
              "name": "Open",
            },
            "summary": "summary",
          },
          "key": "RHEL-1234",
        },
        {
          "fields": {
            "assignee": {
              "displayName": "assignee",
            },
            "customfield_12310243": 5,
            "issuetype": {
              "name": "Story",
            },
            "priority": {
              "name": "Low",
            },
            "status": {
              "name": "Open",
            },
            "summary": "summary",
          },
          "key": "RHEL-1235",
        },
      ]
    `);

    issues = await jira.getIssues(
      undefined,
      'component',
      undefined,
      undefined,
      undefined
    );
    expect(jira.JQL).toMatchInlineSnapshot(
      `"Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed AND component = "component" ORDER BY id DESC"`
    );

    issues = await jira.getIssues(
      undefined,
      'component',
      'assignee',
      undefined,
      undefined
    );
    expect(jira.JQL).toMatchInlineSnapshot(
      `"Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed AND component = "component" AND assignee = "assignee" ORDER BY id DESC"`
    );

    issues = await jira.getIssues(
      undefined,
      'component',
      'assignee',
      'developer',
      'team'
    );
    expect(jira.JQL).toMatchInlineSnapshot(
      `"Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed AND component = "component" AND assignee = "assignee" AND developer = "developer" AND AssignedTeam = "team" ORDER BY id DESC"`
    );

    issues = await jira.getIssues(
      'customJQL',
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(jira.JQL).toMatchInlineSnapshot(
      `"Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed AND customJQL ORDER BY id DESC"`
    );

    issues = await jira.getIssues(
      'customJQL',
      undefined,
      '!assignee',
      'developer',
      '!team'
    );
    expect(jira.JQL).toMatchInlineSnapshot(
      `"Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed AND customJQL AND assignee != "assignee" AND developer = "developer" AND AssignedTeam != "team" ORDER BY id DESC"`
    );
  });

  it('does not add "ORDER BY" if it already exists', async () => {
    await jira.getIssues(
      'ORDER BY status',
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(jira.JQL).not.toContain('ORDER BY id DESC');
    expect(jira.JQL).toContain('ORDER BY status');
  });

  test('setValues()', async () => {
    await jira.setValues('RHEL-1234', 'Minor', undefined, 5);

    expect(mocks.editIssue).toHaveBeenCalledWith({
      issueIdOrKey: 'RHEL-1234',
      fields: {
        customfield_12310243: 5,
        priority: {
          name: 'Minor',
        },
      },
    });
  });

  test('getIssueURL()', () => {
    expect(jira.getIssueURL('RHEL-1234')).toMatchInlineSnapshot(
      `"https://issues.redhat.com/browse/RHEL-1234"`
    );
  });
});
