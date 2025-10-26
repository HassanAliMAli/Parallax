# Contributing to MCP Servers Unified Guide

Thank you for your interest in contributing to the MCP Servers Unified Guide! This document outlines the process for contributing to this project.

## 🌟 How to Contribute

### Reporting Issues

- **Bugs**: Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature Requests**: Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **Documentation**: Report outdated or unclear documentation

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following our coding standards
3. **Write or update tests** as needed
4. **Update documentation** to reflect your changes
5. **Submit a pull request** with a clear description

## 🛠️ Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/mcp-servers-unified-guide.git
cd mcp-servers-unified-guide

# Install dependencies
npm install

# Create a new branch
git checkout -b feature/your-feature-name
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all scripts and tooling
- Follow existing code style and patterns
- Run linter before committing: `npm run lint`
- Format code with Prettier: `npm run format`

### Documentation

- Use clear, concise language
- Follow Markdown best practices
- Run markdown linter: `npm run lint:markdown`
- Include code examples where appropriate
- Use proper heading hierarchy (h1 for title, h2 for sections, etc.)

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(servers): add Python server example
fix(docker): correct port mapping in compose file
docs(readme): update quick start instructions
```

## 🧪 Testing

**TODO:** Add testing guidelines once test infrastructure is in place.

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "server validation"

# Run linters
npm run lint
npm run lint:markdown
```

## 📚 Documentation Guidelines

### Adding Examples

When adding server or client examples:

1. Create a dedicated directory under `servers/` or `clients/`
2. Include a comprehensive README.md
3. Provide working code with clear comments
4. Add configuration files (`.env.example`, etc.)
5. Update the main README.md and support matrix

### Writing Guides

- Start with a clear objective
- Include prerequisites
- Provide step-by-step instructions
- Add troubleshooting sections
- Include links to related resources

## 🔒 Security

- **Never commit secrets** or credentials
- Use `.env.example` for configuration templates
- Report security vulnerabilities privately (see [SECURITY.md](./SECURITY.md))
- Follow security best practices in all examples

## 📋 Review Process

1. **Automated checks** must pass (linting, tests, etc.)
2. **Maintainer review** for code quality and architecture
3. **Documentation review** for clarity and completeness
4. **Final approval** and merge

## 🎯 Priority Areas

**TODO:** Update priority areas based on project needs.

Current focus areas:
- [ ] Client integration guides (Claude Desktop, Cursor, Continue)
- [ ] Server implementation examples (TypeScript, Python)
- [ ] Docker deployment configurations
- [ ] Support matrix automation
- [ ] Security best practices documentation

## 💡 Useful Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## ❓ Questions?

**TODO:** Add community channels and discussion forums.

If you have questions:
- Open a [Discussion](https://github.com/YOUR_ORG/mcp-servers-unified-guide/discussions)
- Check existing [Issues](https://github.com/YOUR_ORG/mcp-servers-unified-guide/issues)
- Review the [FAQ](./docs/faq.md) *(coming soon)*

## 📜 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

Thank you for contributing! 🙌
