import chalk from 'chalk';
import { Command } from 'commander';
import select, { Separator } from '@inquirer/select';
import { z } from 'zod';

import { Jira } from './jira';
import { getLegend } from './legend';
import { getDefaultValue, getOptions, raise, tokenUnavailable } from './util';

import {
  colorPrioritySchema,
  colorSizeSchema,
  issueIdSchema,
  issueStatusSchema,
  issueTypeSchema,
  prioritySchema,
  PriorityWithControls,
  Size,
  SizeWithControls,
} from './schema/jira';

export function cli(): Command {
  const program = new Command();

  program
    .name('storypointer')
    .description('📐 Small CLI tool to set JIRA Story Points and Priority ')
    .version('1.0.0');

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
    .option('-l, --legend', 'Print legend');

  program.argument('[string]', 'Issue keys separated by `␣`');

  return program;
}

const runProgram = async () => {
  const program = cli();
  program.parse();

  const options = getOptions(program.opts());

  if (options.legend) {
    console.log(getLegend());
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
          options.developer
        );

  const numberOfIssues = issues.length;

  console.log(`JQL: ${chalk.dim(jira.JQL)}`);
  console.log(
    `${chalk.bold(numberOfIssues > 10 ? chalk.red(numberOfIssues) : chalk.yellow(numberOfIssues))} issues are waiting to be sized and prioritized.`
  );

  for (const issue of issues) {
    console.log(
      `\n${issueTypeSchema.parse(issue.fields.issuetype.name)} ${issue.key} - ${chalk.bold(issueStatusSchema.parse(issue.fields.status.name))} - ${chalk.italic(issue.fields.assignee?.displayName)}`
    );
    console.log(`${chalk.italic(issue.fields.summary)}`);
    console.log(
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

    // If both values are already set, skip setting them
    if (!setStoryPoints && !setPriority) {
      console.log('Both values are already set. Skipping.');
      continue;
    }

    const message = [];
    if (setStoryPoints) {
      message.push(`story points to ${storyPoints}`);
    }
    if (setPriority) {
      message.push(`priority to ${priority}`);
    }

    console.log(`Setting ${message.join(' and ')}`);
    await jira.setValues(issue.key, priority, storyPoints);
  }
};

export default runProgram;
