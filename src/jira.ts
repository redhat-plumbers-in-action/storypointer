import { Version2Client } from 'jira.js';

import { raise } from './util';
import { Priority, Severity, Size } from './schema/jira';

export class Jira {
  readonly api: Version2Client;
  readonly fields = {
    storyPoints: 'customfield_12310243',
    priority: 'priority',
    severity: 'customfield_12316142',
  };
  readonly baseJQL =
    'Project = RHEL AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed';
  JQL = '';

  constructor(
    readonly instance: string,
    apiToken: string
  ) {
    this.api = new Version2Client({
      host: instance,
      authentication: {
        oauth2: {
          accessToken: apiToken,
        },
      },
    });
  }

  async getVersion(): Promise<string> {
    const response = await this.api.serverInfo.getServerInfo();
    return response.version ?? raise('Jira.getVersion(): missing version.');
  }

  async getIssuesByID(issues: string[]) {
    this.JQL = `issue in (${issues.join(',')}) ORDER BY id DESC`;

    const response = await this.api.issueSearch.searchForIssuesUsingJqlPost({
      jql: this.JQL,
      fields: [
        'id',
        'issuetype',
        'status',
        'components',
        'summary',
        'assignee',
        this.fields.storyPoints,
        this.fields.priority,
      ],
    });

    // TODO: if no issues found dont fail
    return response.issues ?? raise('Jira.getIssuesByID(): missing issues.');
  }

  async getIssues(
    component: string | undefined,
    assignee: string | undefined,
    developer: string | undefined,
    customJQL: string | undefined
  ) {
    this.JQL = this.baseJQL;
    this.JQL += customJQL ? ` AND ${customJQL}` : '';
    this.JQL += this.composeOptionsJQL('component', component);
    this.JQL += this.composeOptionsJQL('assignee', assignee);
    this.JQL += this.composeOptionsJQL('developer', developer);
    this.JQL += ' ORDER BY id DESC';

    const response = await this.api.issueSearch.searchForIssuesUsingJqlPost({
      jql: this.JQL,
      fields: [
        'id',
        'issuetype',
        'status',
        'components',
        'summary',
        'assignee',
        this.fields.storyPoints,
        this.fields.priority,
      ],
    });

    // TODO: if no issues found dont fail
    return response.issues ?? raise('Jira.getIssues(): missing issues.');
  }

  async setValues(
    issue: string,
    priority: Priority,
    severity: Severity,
    size: Size
  ) {
    const priorityValue = priority
      ? { [this.fields.priority]: { name: priority } }
      : {};
    const severityValue = severity
      ? { [this.fields.severity]: { value: severity } }
      : {};
    const storyPointsValue = size ? { [this.fields.storyPoints]: size } : {};

    const response = await this.api.issues.editIssue({
      issueIdOrKey: issue,
      fields: { ...priorityValue, ...severityValue, ...storyPointsValue },
    });
  }

  composeOptionsJQL(key: string, value: string | undefined): string {
    if (!value) return '';

    const negated = this.isNegatedInput(value);
    const formattedValue = negated ? value.slice(1) : value;

    return ` AND ${key} ${negated ? '!=' : '='} "${formattedValue}"`;
  }

  isNegatedInput(input: string | undefined): boolean {
    return input?.startsWith('!') ?? false;
  }

  getIssueURL(issue: string) {
    return `${this.instance}/browse/${issue}`;
  }
}
