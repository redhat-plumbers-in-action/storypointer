#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import select, { Separator } from '@inquirer/select';
import path from 'path';
import { z } from 'zod';

import dotenv from 'dotenv';
import '@total-typescript/ts-reset';

import { Jira } from './jira';
import { raise, tokenUnavailable } from './util';
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

dotenv.config({
  path: [
    `${path.resolve(process.cwd(), '.env.storypointer')}`,
    `${path.resolve(process.cwd(), '.env')}`,
  ],
});

const cli = async () => {
  const program = new Command();

  program
    .name('storypointer')
    .description('📐 Small CLI tool to set JIRA Story Points and Priority ')
    .version('1.0.0');

  program
    .option('-c, --component [component]', 'Issue component')
    .option('-a, --assignee [assignee]', 'Issue assignee')
    .option('-d, --developer [developer]', 'Issue developer');

  program.argument('[string]', 'Issue keys separated by `␣`');

  program.parse();

  const token = process.env.JIRA_API_TOKEN ?? tokenUnavailable();
  const jira = new Jira('https://issues.redhat.com', token);

  const version = await jira.getVersion();
  console.debug(`JIRA Version: ${version}`);

  const options = program.opts();

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

  console.log(
    `${chalk.bold(numberOfIssues > 10 ? chalk.red(numberOfIssues) : chalk.yellow(numberOfIssues))} issues are waiting to be sized and prioritized.`
  );

  for (const issue of issues) {
    console.log(
      `\n${issueTypeSchema.parse(issue.fields.issuetype.name)} ${issue.key} - ${chalk.bold(issueStatusSchema.parse(issue.fields.status.name))} - ${chalk.italic(issue.fields.assignee?.displayName)}`
    );
    console.log(`${chalk.italic(issue.fields.summary)}\n`);

    let storyPoints: Size = issue.fields[jira.fields.storyPoints];
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
      issue.fields[jira.fields.priority]
    );
    let priority = parsedPriority.success ? parsedPriority.data : undefined;
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

    console.log(
      `Setting priority to ${priority} and story points to ${storyPoints}`
    );
    await jira.setValues(issue.key, priority, storyPoints);
  }

  // loop through issues and ask for story points and priority
  //? allow to end at any time

  //? print statistics
};

try {
  cli();
} catch (error) {
  console.error(error);
  process.exit(1);
}
