# Release Notes

## Version 0.1.0 - Initial Scaffold (Unreleased)

### Overview

This is the initial scaffold release of the MCP Servers Unified Guide. The repository structure, governance documents, and development tooling have been established to support future content development.

### What's Included

#### Repository Structure
- **clients/**: Directory for client integration guides
- **servers/**: Directory for server implementation examples
- **scripts/**: Directory for automation and utility scripts
- **examples/**: Directory for end-to-end examples
- **docker/**: Directory for Docker configurations
- **support-matrix/**: Directory for compatibility tracking data
- **assets/**: Directory for images, diagrams, and media
- **.github/**: Directory for CI/CD workflows and templates

#### Governance Documents
- **README.md**: Project overview with TODO markers for future content
- **LICENSE**: MIT License
- **CONTRIBUTING.md**: Contribution guidelines
- **CODE_OF_CONDUCT.md**: Community standards
- **SECURITY.md**: Security policy and vulnerability reporting
- **CHANGELOG.md**: Version history tracking

#### Development Tooling
- **package.json**: Node.js monorepo configuration
- **tsconfig.base.json**: Base TypeScript configuration
- **tsconfig.json**: Root TypeScript configuration
- **eslint.config.js**: ESLint configuration for TypeScript, JSON, and Markdown
- **.prettierrc.json**: Prettier code formatting configuration
- **.markdownlint.json**: Markdown linting rules
- **.editorconfig**: Editor configuration for consistent coding styles
- **.gitignore**: Git ignore patterns
- **.env.example**: Environment variable template

### Getting Started

```bash
# Install dependencies
npm install

# Lint code and documentation
npm run lint
npm run lint:markdown

# Format code
npm run format
```

### Next Steps

**TODO:** Update as development progresses.

Planned for upcoming releases:
- Client integration guides (Claude Desktop, Cursor, Continue)
- TypeScript and Python server examples
- Docker deployment configurations
- Support matrix automation
- CI/CD workflows
- Comprehensive testing infrastructure

### Known Issues

- No content yet in client, server, example directories (expected for scaffold release)
- GitHub issue templates not yet created
- CI/CD workflows not yet configured

### Breaking Changes

None (initial release)

### Migration Guide

N/A (initial release)

---

## Release History

| Version | Date | Status |
|---------|------|--------|
| 0.1.0   | TBD  | In Progress |

---

**TODO:** Maintain this file with each release, documenting notable changes, migration guides, and breaking changes.
