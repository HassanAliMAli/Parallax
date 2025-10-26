# Support Matrix

The support matrix tracks compatibility and feature support across different MCP clients, servers, platforms, and deployment methods.

## Purpose

This directory will house:

1. **Compatibility data**: JSON or YAML files tracking versions and features
2. **Matrix visualizations**: Generated tables for documentation
3. **Test results**: Automated validation of compatibility claims
4. **Update scripts**: Tools to maintain matrix data

## Matrix Dimensions

### Clients
- Claude Desktop (macOS, Windows, Linux)
- Cursor IDE
- Continue.dev
- Zed Editor
- Custom implementations

### Servers
- TypeScript servers
- Python servers
- Rust servers
- Go servers
- Java servers

### Features
- Authentication methods
- Transport protocols (stdio, HTTP, WebSocket)
- Tool/resource support
- Prompts and sampling
- File system access
- Network capabilities

### Platforms
- macOS (Intel, Apple Silicon)
- Windows (x64, ARM)
- Linux (various distributions)
- Docker
- Cloud providers (AWS, Azure, GCP)

## Data Format

**TODO:** Define schema once initial data is collected.

Example structure:
```
support-matrix/
├── data/
│   ├── clients.json
│   ├── servers.json
│   └── compatibility.json
├── generated/
│   └── matrix-tables.md
└── scripts/
    └── generate-matrix.ts
```

## Maintenance

The matrix should be:
- Updated with each new client/server release
- Validated with automated tests
- Regenerated when data changes
- Versioned alongside releases

## TODOs

- [ ] Define JSON/YAML schema for matrix data
- [ ] Create initial compatibility data
- [ ] Build matrix generator script
- [ ] Add automated validation
- [ ] Create visualization templates

---

**Status:** 🚧 Support matrix infrastructure coming soon
