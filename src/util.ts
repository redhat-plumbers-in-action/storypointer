import { OptionValues } from 'commander';

export function raise(error: string): never {
  throw new Error(error);
}

export function tokenUnavailable(): never {
  return raise(
    `JIRA_API_TOKEN not set.\nPlease set the JIRA_API_TOKEN environment variable in '~/.config/storypointer/.env' or '~/.env.storypointer' or '~/.env.'`
  );
}

export function getDefaultValue(
  envName: 'ASSIGNEE' | 'COMPONENT' | 'DEVELOPER'
) {
  return process.env[envName];
}

export function getOptions(inputs: OptionValues): OptionValues {
  return {
    ...inputs,
    assignee: inputs.assignee || getDefaultValue('ASSIGNEE'),
    component: inputs.component || getDefaultValue('COMPONENT'),
    developer: inputs.developer || getDefaultValue('DEVELOPER'),
  };
}
