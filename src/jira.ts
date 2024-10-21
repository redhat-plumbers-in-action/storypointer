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
    'Project = RHEL AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY) AND status != Closed';
  JQL = '';

  constructor(
    readonly instance: string,
    apiToken: string
  ) {
    this.api = new Version2Client({
      host: instance,
      authentication: {
        personalAccessToken: apiToken,
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
    this.JQL += component ? ` AND component = ${component}` : '';
    this.JQL += assignee ? ` AND assignee = "${assignee}"` : '';
    this.JQL += developer ? ` AND developer = "${developer}"` : '';
    this.JQL += ' ORDER BY id DESC';

    const response = await this.api.issueSearch.searchForIssuesUsingJqlPost({
      jql: this.JQL,
      fields: [
        'id',
        'issuetype',
        'status',
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
    size: Size,
    severity: Severity
  ) {
    const response = await this.api.issues.editIssue({
      issueIdOrKey: issue,
      fields: {
        [this.fields.storyPoints]: size,
        [this.fields.priority]: { name: priority },
        [this.fields.severity]: { value: severity },
      },
    });
  }

  getIssueURL(issue: string) {
    return `${this.instance}/browse/${issue}`;
  }
}
