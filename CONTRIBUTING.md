# Contributing

Thanks for your interest in contributing! Here's how to get started.

## Before you start

- For **bug fixes or small changes**, go ahead and open a pull request.
- For **new features or significant changes**, open an issue first to discuss the approach.
- Please read the [Code of Conduct](CODE_OF_CONDUCT.md).

## How to contribute

1. Fork this repository
2. Create a branch: `git checkout -b feat/your-feature-name`
3. Make your changes
4. Push and open a pull request

## Branch names

Use a short prefix that describes the type of change:

| Prefix   | When to use                   |
| -------- | ----------------------------- |
| `feat/`  | New feature                   |
| `fix/`   | Bug fix                       |
| `docs/`  | Documentation only            |
| `chore/` | Maintenance, tooling, cleanup |

## Commit messages

We recommend [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add dark mode support
fix: handle empty input correctly
docs: update installation steps
chore: upgrade dependencies
```

Commit types drive automatic versioning via release-please — `feat:` bumps minor, `feat!:` (or `BREAKING CHANGE:` in the footer) bumps major, and everything else bumps patch.

## Releasing a new version

Releases are fully automated via [release-please](https://github.com/googleapis/release-please-action) — **do not push tags manually**.

1. Merge commits to `main` using conventional commit prefixes. release-please tracks them and opens (or updates) a Release PR with the bumped version and changelog.
2. When the team is ready to ship, merge the Release PR. CI creates the tag and GitHub Release automatically.

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **Major** version → breaking change
- **Minor** version → new feature, backward compatible
- **Patch** version → bug fix or small improvement
