# Contributing

## Before opening a pull request

1. Keep the change limited to this adapter; do not copy private job-search configuration from your own workspace.
2. Run `bun test` and `bun run typecheck` from `adapter/into-design-systems-search/cli`. CI runs both on every pull request.
3. Keep the test suite offline. Every network call is stubbed, and it must stay that way — people are asked to audit this adapter before installing it, and running its tests with no network access is part of that check.
4. Keep runtime dependencies at zero. `package.json` must have an empty `dependencies` and no lifecycle scripts (`postinstall` and friends), for the same reason.
5. Do not add API keys, credentials, candidate profiles, CVs, saved searches, applications, or job exports.
6. Explain the observed MCP response or workflow behaviour in the pull request description, without pasting personal information.

## Scope

This project is a read-only job-research adapter. It does not automate applications, fill job forms, bypass authentication, or turn public job-board data into a claim of endorsement by Into Design Systems or its author.

By contributing, you agree that your work may be distributed under this repository's [MIT License](LICENSE).
