# Documentation Index

This folder contains all project documentation for TaskMeshAI.

## Quick Links

### Getting Started
- [Development Setup](./DEVELOPMENT.md) - Local development environment setup
- [Supabase Setup](./SUPABASE_SETUP.md) - Database and connectivity guide
- [Build Summary](./BUILD_SUMMARY.md) - Project structure and build info

### Architecture & Design
- [Architecture](./ARCHITECTURE.md) - System design and component overview
- [Next Steps](./NEXT_STEPS.md) - Future improvements and roadmap

### Testing
- [Testing Guide](./TESTING.md) - Unit tests, coverage, and test strategy

### Quality & Dependencies
- [Dependency Audit](./DEPENDENCY_AUDIT.md) - Dependencies and security audit

## Document Overview

| Document | Purpose | Audience |
|----------|---------|----------|
| ARCHITECTURE.md | System design, components, data flow | Developers, Architects |
| BUILD_SUMMARY.md | Build process, deployment, environment setup | DevOps, Developers |
| DEPENDENCY_AUDIT.md | Dependencies, versions, vulnerabilities | Security, DevOps |
| DEVELOPMENT.md | Local setup, development workflow | Developers |
| NEXT_STEPS.md | Roadmap, improvements, features | Product, Developers |
| SUPABASE_SETUP.md | Database setup and connectivity verification | Developers, DevOps |
| TESTING.md | Test suite, coverage, test strategy | QA, Developers |

## Contributing

When adding new documentation:
1. Place files in this `docs/` folder
2. Update this index with a reference
3. Use consistent formatting (Markdown)
4. Include examples where helpful
5. Keep content up-to-date with code changes

## Quick Commands

```bash
# Run tests
pnpm test

# Check coverage
NODE_ENV=test pnpm exec jest --coverage

# Start development
pnpm dev

# Build for production
pnpm build
```
