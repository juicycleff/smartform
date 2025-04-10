# Contributing Guide

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages to automate version management and package releases.

## Commit Message Format

Each commit message consists of a **header**, a **body**, and a **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

The **header** is mandatory and must conform to the following format:

- **type**: The type of change being made (e.g., feat, fix, docs)
- **scope** (optional): The scope of the change (e.g., component or file name)
- **subject**: A short description of the change

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files

## Breaking Changes

A commit that introduces a breaking API change should:

1. Have a footer starting with `BREAKING CHANGE:` followed by a space or two newlines and a description
2. Include a `!` after the type/scope to highlight that it contains breaking changes

Example:
```
feat!: remove support for Node 10

BREAKING CHANGE: Node 10 is no longer supported.
```

## Examples

```
feat: add user authentication

fix(api): handle error responses properly

docs: update README with new API endpoints

style(button): improve button component styling

refactor: reorganize utility functions

perf(rendering): optimize rendering performance

test(auth): add tests for authentication service

build(deps): update dependencies

ci: configure GitHub Actions workflow

chore: update .gitignore
```

## Automated Versioning

This project uses automatic versioning based on conventional commits:

- `fix:` commits trigger a PATCH release (e.g., 1.0.0 → 1.0.1)
- `feat:` commits trigger a MINOR release (e.g., 1.0.0 → 1.1.0)
- Any commit with `BREAKING CHANGE:` in the footer or with `!` after type/scope triggers a MAJOR release (e.g., 1.0.0 → 2.0.0)

## Release Process

1. Push your changes to the main branch using conventional commits
2. The CI/CD pipeline will automatically:
    - Analyze commits since the last release
    - Determine the next version number
    - Create a release pull request
    - Generate a changelog
3. Review and merge the release PR
4. Upon merging, the system will:
    - Create a GitHub release with release notes
    - Publish the Go package
    - Publish the NPM packages for the frontend components