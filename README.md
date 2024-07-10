# Background Run & Test GitHub Action

[![GitHub stars](https://img.shields.io/github/stars/MohamedRaslan/backgrond_run_and_test)](https://github.com/MohamedRaslan/backgrond_run_and_test/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/MohamedRaslan/backgrond_run_and_test)](https://github.com/MohamedRaslan/backgrond_run_and_test/network)
[![GitHub issues](https://img.shields.io/github/issues/MohamedRaslan/backgrond_run_and_test)](https://github.com/MohamedRaslan/backgrond_run_and_test/issues)
[![GitHub Release Date](https://img.shields.io/github/release-date/mohamedraslan/backgrond_run_and_test)](https://github.com/MohamedRaslan/backgrond_run_and_test/releases)
[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/mohamedraslan/backgrond_run_and_test)](https://github.com/MohamedRaslan/backgrond_run_and_test)

[![Lint Codebase](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/linter.yml/badge.svg)](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/linter.yml)
[![Dependabot Updates](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/dependabot/dependabot-updates)
[![Continuous Integration](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/ci.yml/badge.svg)](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/ci.yml)
[![Check Transpiled JavaScript](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/check-dist.yml/badge.svg)](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/MohamedRaslan/backgrond_run_and_test/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

GitHub Action to run a commands (e.g. a test) while also running another
commands (e.g. a server) in the background, And you could conditional wait for
the background resources to be available the `wait-on` use the
**[wait-on](https://www.yarnjs.com/package/wait-on)** Yarn package under the
hood so most of the `waiton` functionality should be accepted.

> :information_source: **Notice**
>
> - The code was derived from the
>   [cypress-io/github-action](https://github.com/cypress-io/github-action), but
>   with a few additions and enhancements for more general usage.
> - **Intial vesion (v1.0.0)** not tested very well, but the following versions
>   should be more tested and muture.

## :wink: Features

**The action lets you dow the following:**

- Run a `command` or `command-windows` in the background to open a server or do
  some background tasks while running your tests
- Optionally wait for resources before running your test, your resources could
  be (files, ports, sockets, or http(s) resources to become available (or not
  available using reverse mode)) as it use the
  **[wait-on](https://www.yarnjs.com/package/wait-on)** Yarn package under the
  hood
- Conditional wait using the `wait-if` option
- You can run multiple commands at once

### Usage

Run a Node.js server in the background while executing tests

```yaml
name: Run Tests
on: [push]
jobs:
  run-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Run E2E Tests
        uses: MohamedRaslan/backgrond_run_and_test@v1
        with:
          start: yarn run start:apps:server:apps:server
          command: yarn run test:apps
```

### Multiple commands command

You can also specify a build command before

```yaml
name: Run Tests
on: [push]
jobs:
  run-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Run E2E Tests
        uses: MohamedRaslan/backgrond_run_and_test@v1
        with:
          start: yarn run app:api, yarn run app:web
          command: yarn run generate:docs, yarn run test:apps
```

### Windows

Sometimes on Windows you need to run a different start command. You can use
`start-windows` and `command-windows` parameter for this, which takes precedence
over the normal commands when on Windows.

```yaml
name: Run Tests
on: [push]
jobs:
  run-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Run E2E Tests
        uses: MohamedRaslan/backgrond_run_and_test@v1
        with:
          start: yarn run start:apps:server:apps:server
          start-windows: yarn run start:apps:server:windows
          command: yarn run test:apps
          command-windows: yarn run tests:apps:windows
```

### Current working directory

If you want to set a specific directory where your commands are run, you can
specify the path via the `cwd` option

```yaml
name: Run Tests
on: [push]
jobs:
  run-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Run E2E Tests
        uses: MohamedRaslan/backgrond_run_and_test@v1
        with:
          cwd: ./packages/example
          start: yarn run start:apps:server:apps:server
```

### Wait for server

If you are starting a local server and it takes a while to start, you can add a
parameter `wait-on` and pass URL to wait for the server to respond.

```yaml
name: Run Tests
on: [push]
jobs:
  run-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Run E2E Tests
        uses: MohamedRaslan/backgrond_run_and_test@v1
        with:
          start: yarn run start:apps:server
          wait-on: 'http://localhost:8080'
          command: yarn run test:apps
```

By default, wait-on will retry for 60 seconds. You can pass a custom timeout in
seconds using `wait-on-timeout`.

```yaml
- uses: MohamedRaslan/backgrond_run_and_test@v1
    with:
      start: yarn run start:apps:server
      wait-on: 'http://localhost:8080'
      # wait for 2 minutes for the server to respond
      wait-on-timeout: 120
      command: yarn run test:apps
```

You can wait for multiple URLs to respond by separating URLs with a comma

```yaml
- uses: MohamedRaslan/backgrond_run_and_test@v1
    with:
      start: yarn run start:apps:server
      wait-on: 'http://localhost:8080, http://localhost:4000'
      command: yarn run test:apps
```

Wait use **[wait-on](https://www.yarnjs.com/package/wait-on)** and be defualt it
wait for a HEAD response st, you can make it wait for GET response instead as
follow

```yaml
- uses: MohamedRaslan/backgrond_run_and_test@v1
    with:
      start: yarn run start:apps:server
      wait-on: 'http-get://localhost:8080, http://localhost:4000'
      # This will wait for the GET response of the 1st one and HEAD response to the 2nd one
      command: yarn run test:apps
```

### Conditional wait

You can also wait or not based on condtion using the `wait-if`
:information_source: Note: By default it will wait

```yaml
name: Run Tests
on: [push]
jobs:
  run-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Lint the app
        id: lint
        run: yarn run lint
      - name: Run E2E Tests
        uses: MohamedRaslan/backgrond_run_and_test@v1
        with:
          start: yarn run start:apps:server
          wait-if:
            contains( github.base_ref , 'local' ) || ${{ failure() &&
            steps.lint.outcome == 'failure' }}
          command: yarn run test:apps
```

## :see_no_evil: Issues

If you encounter any problems, please
**[file an issue](https://github.com/MohamedRaslan/backgrond_run_and_test/issues)**
along with a detailed description.

## :handshake: Contributing

Contributions are very welcome :heart:.

## :nerd_face: Credits & Resources

- **[wait-on :heart_eyes:](https://github.com/jeffbski/wait-on)** by
  **[Jeff Barczewski](https://github.com/jeffbski)**
- **[Cypress-io/GitHub Action :heart_eyes:](https://github.com/cypress-io/github-action)**
- **[Background-Server-Action :heart_eyes:](https://github.com/MohamedRaslan/backgrond_run_and_test)**
  by **[Bernhard Wittmann](https://github.com/BerniWittmann)**
- **[GitHub Docs - Createing Actions](https://docs.github.com/en/actions/creating-actions)**
- **[Actions/Typescript-Action](actions/typescript-action)**
