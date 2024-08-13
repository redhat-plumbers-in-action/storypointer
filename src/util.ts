export function raise(error: string): never {
  throw new Error(error);
}

export function tokenUnavailable(): never {
  return raise(
    `JIRA_API_TOKEN not set.\nPlease set the JIRA_API_TOKEN environment variable in '~/.config/storypointer/.env' or '~/.env.storypointer' or '~/.env.'`
  );
}
