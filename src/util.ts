import { OptionValues } from 'commander';
import os from 'os';

export function raise(error: string): never {
  throw new Error(error);
}

export function tokenUnavailable(): never {
  return raise(
    `JIRA_API_TOKEN not set.\nPlease set the JIRA_API_TOKEN environment variable in '~/.config/storypointer/.env' or '~/.env.storypointer' or '~/.env.'`
  );
}

export function getUserFromLogin(): string {
  const login = os.userInfo().username;
  return `${login}@redhat.com`;
}

export function isDefaultValuesDisabled(): boolean {
  return process.env['NODEFAULTS'] ? true : false;
}

export function getDefaultValue(
  envName: 'ASSIGNEE' | 'COMPONENT' | 'DEVELOPER' | 'TEAM' | 'JQL' | 'NOCOLOR'
) {
  if (isDefaultValuesDisabled()) {
    return undefined;
  }

  const value = process.env[envName];

  if (envName === 'ASSIGNEE' && !value) {
    return getUserFromLogin();
  }

  if (envName === 'NOCOLOR' && !value) {
    return false;
  }

  return value;
}

export function getOptions(inputs: OptionValues): OptionValues {
  return {
    ...inputs,
    assignee: inputs.assignee || getDefaultValue('ASSIGNEE'),
    component: inputs.component || getDefaultValue('COMPONENT'),
    developer: inputs.developer || getDefaultValue('DEVELOPER'),
  };
}
