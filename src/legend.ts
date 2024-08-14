import chalk from 'chalk';
import { issueStatusSchema } from './schema/jira';

export function getLegend() {
  return `
    Issue Legend:

    <TYPE> <ISSUE-KEY> - ${chalk.bold('<STATUS>')} - ${chalk.italic('<ASSIGNEE>')}
    ${chalk.italic('<ISSUE DESCRIPTION>')}
    See more: ${chalk.italic.underline('<URL>')}

    <TYPE>:
      ☑️ - Task
      🐛 - Bug
      🎁 - Story
      ⚡ - Epic

    <STATUS>:
      ${issueStatusSchema.parse('New')}
      ${issueStatusSchema.parse('Planning')}
      ${issueStatusSchema.parse('In Progress')}
      ${issueStatusSchema.parse('Integration')}
      ${issueStatusSchema.parse('Release Pending')}

    Example:
      🐛 RHEL-1234 - ${chalk.bold(issueStatusSchema.parse('In Progress'))} - ${chalk.italic('Assignee')}
      ${chalk.italic('Add new feature to curl')}
      See more: ${chalk.italic.underline('https://issues.redhat.com/browse/RHEL-1234')}`;
}
