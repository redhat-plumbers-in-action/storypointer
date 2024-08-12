import { Version2Client } from 'jira.js';

import { raise } from './util';
import { Priority, Size } from './schema/jira';

export class Jira {
  readonly api: Version2Client;
  readonly fields = {
    storyPoints: 'customfield_12310243',
    priority: 'priority',
  };
  readonly baseJQL =
    'project = RHEL AND ("Story Points" is EMPTY OR priority is EMPTY) AND status != Closed';

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
    const response = await this.api.issueSearch.searchForIssuesUsingJqlPost({
      jql: `issue in (${issues.join(',')}) ORDER BY id DESC`,
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

  async getIssues(component: string, assignee?: string) {
    const assigneeQuery = assignee ? `AND assignee = "${assignee}"` : '';
    const componentQuery = component ? `AND component = ${component}` : '';

    const response = await this.api.issueSearch.searchForIssuesUsingJqlPost({
      jql: `${this.baseJQL} ${assigneeQuery} ${componentQuery} ORDER BY id DESC`,
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

  async setValues(issue: string, priority: Priority, size: Size) {
    const response = await this.api.issues.editIssue({
      issueIdOrKey: issue,
      fields: {
        [this.fields.storyPoints]: size,
        [this.fields.priority]: { name: priority },
      },
    });
  }
}
