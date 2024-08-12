# JIRA StoryPointer

[![npm version][npm-status]][npm] [![Tests][test-status]][test] [![Linters][lint-status]][lint] [![CodeQL][codeql-status]][codeql] [![codecov][codecov-status]][codecov]

[npm]: https://www.npmjs.com/package/storypointer
[npm-status]: https://img.shields.io/npm/v/storypointer

[test]: https://github.com/redhat-plumbers-in-action/storypointer/actions/workflows/tests.yml
[test-status]: https://github.com/redhat-plumbers-in-action/storypointer/actions/workflows/tests.yml/badge.svg

[lint]: https://github.com/redhat-plumbers-in-action/storypointer/actions/workflows/lint.yml
[lint-status]: https://github.com/redhat-plumbers-in-action/storypointer/actions/workflows/lint.yml/badge.svg

[codeql]: https://github.com/redhat-plumbers-in-action/storypointer/actions/workflows/codeql-analysis.yml
[codeql-status]: https://github.com/redhat-plumbers-in-action/storypointer/actions/workflows/codeql-analysis.yml/badge.svg

[codecov]: https://codecov.io/gh/redhat-plumbers-in-action/storypointer
[codecov-status]: https://codecov.io/gh/redhat-plumbers-in-action/storypointer/graph/badge.svg?token=79yXVIeHyn

<!-- -->

## Description

Simple CLI tool that provides interactive interface to quicly set priority and story points for your JIRA issues. No need to open JIRA web interface.

## Usage

Make sure to store your JIRA Personal Access Token (PAT) in the `~/.env.storypointer` file:

```bash
# ~/.env.storypointer
JIRA_API_TOKEN="exaple-token"
```

### Using Node.js

```bash
# run it using npx
npx storypointer

# or install it globally using npm
npm install -g storypointer
storypointer
```

### Using Fedora

> [!IMPORTANT]
>
> The Fedora package is not available yet.

## How to use

> [!IMPORTANT]
>
> This tool is intended to be used by Red Hat employees on the Red Hat JIRA instance. It may be adapted to work with other JIRA instances in the future.

```bash
$ storypointer --help
Usage: storypointer [options] [string]

📐 Small CLI tool to set JIRA Story Points and Priority

Arguments:
  string                       Issue keys separated by `␣`

Options:
  -V, --version                output the version number
  -c, --component [component]  Issue component
  -a, --assignee [assignee]    Issue assignee
  -h, --help                   display help for command
```

### Examples

Size all issues of the `curl` component:

```bash
storypointer -c curl
# output:
JIRA Version: 9.12.10
5 issues are waiting to be sized and prioritized.

🐛 RHEL-1234 - In Progress - Assignee
Add new feature to curl

? Story Points
  1
  2
❯ 3
  5
  8
  13
```

You can use the arrow keys to select the story points and press `Enter` to confirm. Then you can select the priority. You can exit the tool by pressing `Ctrl+C` or selecting the `Exit` option.
