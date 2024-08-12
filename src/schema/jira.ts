import chalk from 'chalk';
import { z } from 'zod';

export const sizeSchema = z.union([
  z.literal(1), // green
  z.literal(2), // green
  z.literal(3), // yellow
  z.literal(5), // yellow bold
  z.literal(8), // red
  z.literal(13), // red bold
]);

export const colorSizeSchema = sizeSchema.transform(val => {
  switch (val) {
    case 1:
      return chalk.green(val);
    case 2:
      return chalk.green(val);
    case 3:
      return chalk.yellow(val);
    case 5:
      return chalk.yellow.bold(val);
    case 8:
      return chalk.red(val);
    case 13:
      return chalk.red.bold(val);
    default:
      return val;
  }
});

export type Size = z.infer<typeof sizeSchema>;
export type SizeWithControls = Size | 0 | -1;

export const prioritySchema = z.union([
  z.literal('Blocker'), // red bold
  z.literal('Critical'), // red
  z.literal('Major'), // yellow
  z.literal('Normal'), // white
  z.literal('Minor'), // cyan
]);

export const colorPrioritySchema = prioritySchema.transform(val => {
  switch (val) {
    case 'Blocker':
      return chalk.red.bold(val);
    case 'Critical':
      return chalk.red(val);
    case 'Major':
      return chalk.yellow(val);
    case 'Minor':
      return chalk.cyan(val);
    default:
      return val;
  }
});

export type Priority = z.infer<typeof prioritySchema>;
export type PriorityWithControls = Priority | '0' | '-1';

export const issueIdSchema = z.string().regex(/^RHEL-\d+$/);

export type IssueID = z.infer<typeof issueIdSchema>;

export const issueTypeSchema = z
  .union([
    z.literal('Task'),
    z.literal('Bug'),
    z.literal('Story'),
    z.literal('Epic'),
  ])
  .transform(val => {
    switch (val) {
      case 'Task':
        return '☑️';
      case 'Bug':
        return '🐛';
      case 'Story':
        return '🎁';
      case 'Epic':
        return '⚡';
      default:
        return val;
    }
  });

export const issueStatusSchema = z
  .union([
    z.literal('New'),
    z.literal('Planning'),
    z.literal('In Progress'),
    z.literal('Integration'),
    z.literal('Release Pending'),
  ])
  .transform(val => {
    switch (val) {
      case 'New':
        return chalk.cyan(val);
      case 'Planning':
        return chalk.cyan(val);
      case 'In Progress':
        return chalk.blue(val);
      case 'Integration':
        return chalk.green(val);
      case 'Release Pending':
        return chalk.green(val);
      default:
        return val;
    }
  });
