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

Simple CLI tool that provides an interactive interface to quickly set priority, severity and story points for your JIRA issues. No need to open the JIRA web interface.

StoryPointer uses base JQL query to fetch issues that are not closed and have no story points or priority set - `Project = RHEL AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed`. The query can be customized using the CLI command options or by setting ENV variables.

## Usage

Make sure to store your JIRA Personal Access Token (PAT) in the `~/.config/storypointer/.env` or `~/.env.storypointer` file:

```bash
# ~/.config/storypointer/.env
JIRA_API_TOKEN="exaple-token"
```

> [!TIP]
>
> You can also set default values for the `assignee`, `developer`, `component` and more in the `~/.config/storypointer/.env` or `~/.env.storypointer` file:
>
> ```bash
> # ~/.config/storypointer/.env
> ASSIGNEE="your-jira-username"
> DEVELOPER="your-jira-username"
> TEAM="your-jira-team"
> COMPONENT="your-component"
> JQL="your-jql-query"
> ```

### Using Node.js

```bash
# run it using npx
npx storypointer

# or install it globally using npm
npm install -g storypointer
storypointer
```

### Using RHEL Developer Toolbox

StoryPointer is available as a module in [RHEL Developer Toolbox](https://gitlab.com/redhat/rhel/tools/rhel-developer-toolbox). StoryPointer module documentation is available [here](https://gitlab.com/redhat/rhel/tools/rhel-developer-toolbox/-/blob/main/doc/source/modules/storypointer.rst).

## How to use

> [!IMPORTANT]
>
> This tool is intended to be used by Red Hat employees on the Red Hat JIRA instance. It may be adapted to work with other JIRA instances in the future.

```md
$ storypointer --help
Usage: storypointer [options] [string]

📐 Small CLI tool to set JIRA Story Points and Priority

Arguments:
  string                       Issue keys separated by `␣`

Options:
  -V, --version                output the version number
  -c, --component [component]  Issue component, use `!` to exclude component
  -a, --assignee [assignee]    Issue assignee, use `!` to exclude assignee (default: "<user-login>@redhat.com")
  -d, --developer [developer]  Issue developer, use `!` to exclude developer
  -t, --team [team]            Issue AssignedTeam, use `!` to exclude team
  -j, --jql [jql]              JQL query
  -l, --legend                 Print legend
  -n, --nocolor                Disable color output (default: false)
  -h, --help                   display help for command
```

> [!NOTE]
>
> Only `50` issues are fetched from JIRA at a time. If you want to triage more than `50` issues just run the command again.

> [!TIP]
>
> You can disable default values by setting `NODEFAULTS` environment variable to `true`:
>
> ```bash
> NODEFAULTS=true npx storypointer
> ```
>
> Similarly, you can disable color output by setting the `NOCOLOR` environment variable to `true`.

### Examples

Size all issues of the `curl` component:

```md
storypointer -c curl

JIRA Version: 9.12.10
JQL: Project = RHEL AND (type in (Story, Task) AND ("Story Points" is EMPTY OR priority is EMPTY) OR type not in (Story, Task) AND  ("Story Points" is EMPTY OR priority is EMPTY OR Severity is EMPTY)) AND status != Closed AND component = curl ORDER BY id DESC
5 issues are waiting to be sized, prioritized, or set severity.

🐛 RHEL-1234 - In Progress - Assignee
curl - Add new feature to curl
See more: https://issues.redhat.com/browse/RHEL-1234

? Story Points
  1
  2
❯ 3
  5
  8
  13
 ---
  SKIP
  EXIT
```

You can use the arrow keys to select the story points and press `Enter` to confirm. Then you can select the priority. You can exit the tool by pressing `Ctrl+C` or selecting the `Exit` option.
