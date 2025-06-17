import { Version2Client } from 'jira.js';
import { Issue } from 'jira.js/dist/esm/types/version2/models';

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
    'Project in (RHEL, "RHEL Miscellaneous", Fedora) AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed';
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

    const response =
      await this.api.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
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

  async getIssues(customJQL: string | undefined): Promise<Issue[]>;
  async getIssues(
    customJQL: string | undefined,
    component: string | undefined,
    assignee: string | undefined,
    developer: string | undefined,
    team: string | undefined
  ): Promise<Issue[]>;
  async getIssues(
    customJQL?: string | undefined,
    component?: string | undefined,
    assignee?: string | undefined,
    developer?: string | undefined,
    team?: string | undefined
  ) {
    this.JQL = this.baseJQL;
    this.JQL += customJQL ? ` AND ${customJQL}` : '';
    this.JQL += this.composeOptionsJQL('component', component);
    this.JQL += this.composeOptionsJQL('assignee', assignee);
    this.JQL += this.composeOptionsJQL('developer', developer);
    this.JQL += this.composeOptionsJQL('AssignedTeam', team);
    // When using a custom JQL or filter, we need to check if the order by is already present (only one order by is allowed)
    this.JQL +=
      this.JQL.search(/.*order\s+by/i) === -1 ? ' ORDER BY id DESC' : '';

    const response =
      await this.api.issueSearch.searchForIssuesUsingJqlEnhancedSearchPost({
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

    await this.api.issues.editIssue({
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

  async getFilters() {
    // ! FIXME: replace getFavouriteFilters with getMyFilters() once we migrate to Cloud!
    const response = await this.api.filters.getFavouriteFilters();

    return response ?? raise('Jira.getFilters(): missing filters.');
  }

  isNegatedInput(input: string | undefined): boolean {
    return input?.startsWith('!') ?? false;
  }

  getIssueURL(issue: string) {
    return `${this.instance}/browse/${issue}`;
  }
}
