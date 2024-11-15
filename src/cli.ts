import chalk from 'chalk';
import { Command } from 'commander';
import select, { Separator } from '@inquirer/select';
import { z } from 'zod';

import { Jira } from './jira';
import { getLegend } from './legend';
import { Logger } from './logger';
import { getDefaultValue, getOptions, raise, tokenUnavailable } from './util';

import {
  colorPrioritySchema,
  colorSeveritySchema,
  colorSizeSchema,
  issueIdSchema,
  issueStatusSchema,
  issueTypeSchema,
  prioritySchema,
  PriorityWithControls,
  severitySchema,
  SeverityWithControls,
  Size,
  SizeWithControls,
} from './schema/jira';

export function cli(): Command {
  const program = new Command();

  program
    .name('storypointer')
    .description(
      '📐 Small CLI tool to set JIRA Story Points, Priority and Severity'
    )
    .version('1.7.0');

  program
    .option(
      '-c, --component [component]',
      'Issue component',
      getDefaultValue('COMPONENT')
    )
    .option(
      '-a, --assignee [assignee]',
      'Issue assignee',
      getDefaultValue('ASSIGNEE')
    )
    .option(
      '-d, --developer [developer]',
      'Issue developer',
      getDefaultValue('DEVELOPER')
    )
    .option('-j, --jql [jql]', 'JQL query', getDefaultValue('JQL'))
    .option('-l, --legend', 'Print legend')
    .option(
      '-n, --nocolor',
      'Disable color output',
      getDefaultValue('NOCOLOR')
    );

  program.argument('[string]', 'Issue keys separated by `␣`');

  return program;
}

const runProgram = async () => {
  const program = cli();
  program.parse();

  const options = getOptions(program.opts());
  const logger = new Logger(!!options.nocolor);

  if (options.legend) {
    logger.log(getLegend());
    process.exit(0);
  }

  const token = process.env.JIRA_API_TOKEN ?? tokenUnavailable();
  const jira = new Jira('https://issues.redhat.com', token);

  const version = await jira.getVersion();
  console.debug(`JIRA Version: ${version}`);

  const argsParsed = z.array(issueIdSchema).safeParse(program.args);
  const args = argsParsed.success
    ? argsParsed.data
    : raise('Invalid issue key.');

  const issues =
    args.length > 0
      ? await jira.getIssuesByID(args)
      : await jira.getIssues(
          options.component,
          options.assignee,
          options.developer,
          options.jql
        );

  const numberOfIssues = issues.length;

  logger.log(`JQL: ${chalk.dim(jira.JQL)}`);
  logger.log(
    `${chalk.bold(numberOfIssues > 10 ? chalk.red(numberOfIssues) : chalk.yellow(numberOfIssues))} issues are waiting to be sized, prioritized, or set severity.`
  );

  for (const issue of issues) {
    logger.log(
      `\n${issueTypeSchema.parse(issue.fields.issuetype.name)} ${issue.key} - ${chalk.bold(issueStatusSchema.parse(issue.fields.status.name))} - ${chalk.italic(issue.fields.assignee?.displayName)}`
    );
    logger.log(
      `${chalk.underline(issue.fields.components.length > 0 ? issue.fields.components.map(component => component.name).join(', ') : 'NO COMPONENT')} - ${chalk.italic(issue.fields.summary)}`
    );
    logger.log(
      `See more: ${chalk.italic.underline(jira.getIssueURL(issue.key))}\n`
    );

    let storyPoints: Size = issue.fields[jira.fields.storyPoints];
    const setStoryPoints = !storyPoints;

    if (!storyPoints) {
      const answer: SizeWithControls = await select({
        message: 'Story Points',
        choices: [
          {
            name: colorSizeSchema.parse(1),
            value: 1,
          },
          {
            name: colorSizeSchema.parse(2),
            value: 2,
          },
          {
            name: colorSizeSchema.parse(3),
            value: 3,
          },
          {
            name: colorSizeSchema.parse(5),
            value: 5,
          },
          {
            name: colorSizeSchema.parse(8),
            value: 8,
          },
          {
            name: colorSizeSchema.parse(13),
            value: 13,
          },
          new Separator('---'),
          {
            name: 'SKIP',
            value: 0,
          },
          {
            name: 'EXIT',
            value: -1,
          },
        ],
        default: 3,
        pageSize: 9,
        loop: false,
      });

      if (answer === 0) {
        continue;
      }

      if (answer === -1) {
        process.exit(0);
      }

      storyPoints = answer;
    }

    // NOTE: undefined priority is value "Undefined" so we need to check for it
    const parsedPriority = prioritySchema.safeParse(
      issue.fields[jira.fields.priority].name
    );
    let priority = parsedPriority.success ? parsedPriority.data : undefined;
    const setPriority = !priority;

    if (!priority) {
      const answer: PriorityWithControls = await select({
        message: 'Priority',
        choices: [
          {
            name: colorPrioritySchema.parse('Minor'),
            value: 'Minor',
          },
          {
            name: 'Normal',
            value: 'Normal',
          },
          {
            name: colorPrioritySchema.parse('Major'),
            value: 'Major',
          },
          {
            name: colorPrioritySchema.parse('Critical'),
            value: 'Critical',
          },
          {
            name: colorPrioritySchema.parse('Blocker'),
            value: 'Blocker',
          },
          new Separator(),
          {
            name: 'SKIP',
            value: '0',
          },
          {
            name: 'EXIT',
            value: '-1',
          },
        ],
        default: 'Normal',
        pageSize: 8,
        loop: false,
      });

      if (answer === '0') {
        continue;
      }

      if (answer === '-1') {
        process.exit(0);
      }

      priority = answer;
    }

    // Set severity
    const parsedSeverity = severitySchema.safeParse(
      issue.fields[jira.fields.severity]?.value
    );
    let severity = parsedSeverity.success ? parsedSeverity.data : undefined;
    const setSeverity = !severity;

    // This is workaround, We should use api to determine what values are available on the issue
    if (!severity && issue.fields.issuetype.name !== 'Story') {
      const answer: SeverityWithControls = await select({
        message: 'Severity',
        choices: [
          {
            name: colorSeveritySchema.parse('Low'),
            value: 'Low',
          },
          {
            name: 'Moderate',
            value: 'Moderate',
          },
          {
            name: colorSeveritySchema.parse('Important'),
            value: 'Important',
          },
          {
            name: colorSeveritySchema.parse('Critical'),
            value: 'Critical',
          },
          new Separator(),
          {
            name: 'SKIP',
            value: '0',
          },
          {
            name: 'EXIT',
            value: '-1',
          },
        ],
        default: 'Moderate',
        loop: false,
      });

      if (answer === '0') {
        continue;
      }

      if (answer === '-1') {
        process.exit(0);
      }

      severity = answer;
    }

    // If both values are already set, skip setting them
    if (!setStoryPoints && !setPriority && !setSeverity) {
      logger.log('Nothing to do. Skipping.');
      continue;
    }

    const message = [];
    if (setStoryPoints) {
      message.push(`story points to ${storyPoints}`);
    }
    if (setPriority) {
      message.push(`priority to ${priority}`);
    }
    if (setSeverity) {
      message.push(`severity to ${severity}`);
    }

    logger.log(`Setting ${message.join(' and ')}`);
    await jira.setValues(issue.key, priority, storyPoints, severity);
  }
};

export default runProgram;
