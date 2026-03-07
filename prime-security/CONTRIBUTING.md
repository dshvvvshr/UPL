# Contributing to Prime Security

Thank you for your interest in contributing to Prime Security (Under Pressure Looming)! This project implements a self-organizing, multi-agent security framework governed by the Core Directive.

## Core Directive Compliance

**All contributions must align with the [Core Directive](./CORE_DIRECTIVE.md).** This is the foundational, non-negotiable requirement for any code or documentation changes.

Before submitting:
1. Read the [Core Directive](./CORE_DIRECTIVE.md)
2. Review the [Architecture](./notes/ARCHITECTURE_DRAFT.md)
3. Understand the [Research Foundations](./UNDER_PRESSURE_LOOMING.md)

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Prime-security.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Building
```bash
npm run build
```

### Testing
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

### Linting
```bash
npm run lint            # Check for issues
npm run lint:fix        # Auto-fix issues
npm run format          # Format with Prettier
```

## Code Standards

### TypeScript
- Use strict TypeScript
- Prefer interfaces over types where appropriate
- Document public APIs with JSDoc comments
- No `any` types (use `unknown` if truly needed)

### Security
- All inputs must be validated
- Use provided crypto primitives from `src/security/crypto.ts`
- Log security-relevant events via `auditLogger`
- Never commit secrets or credentials

### Testing
- Write tests for new functionality
- Maintain >70% code coverage
- Test both success and failure paths
- Use descriptive test names

### Documentation
- Update README.md if adding user-facing features
- Document architecture changes in `notes/ARCHITECTURE_DRAFT.md`
- Add inline comments for complex logic
- Update UNDER_PRESSURE_LOOMING.md for new research/tools

## Pull Request Process

1. **Create descriptive PR title**: `feat: add X` or `fix: resolve Y`
2. **Reference issues**: Link to related issues
3. **Pass CI checks**: All tests and lints must pass
4. **Core Directive compliance**: Automated check will verify
5. **Code review**: At least one approval required
6. **Documentation**: Update relevant docs

### PR Template
```markdown
## Description
Brief description of changes

## Core Directive Compliance
- [ ] Changes align with Core Directive principles
- [ ] Security-first approach maintained
- [ ] Audit logging added where appropriate
- [ ] No compromise of user data or privacy

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Documentation
- [ ] Code comments added
- [ ] README updated (if needed)
- [ ] Architecture doc updated (if needed)
```

## Module Development

When adding new modules:

1. **Register in Module Registry**
   ```typescript
   import { registry, Module } from './registry';
   
   const myModule: Module = {
     name: 'my-module',
     version: '0.1.0',
     dependencies: ['core-security'],
     init: async () => { /* ... */ },
     start: async () => { /* ... */ },
     stop: async () => { /* ... */ }
   };
   
   registry.register(myModule);
   ```

2. **Add to System Blueprint**
   - Update `src/autonomic/dna.ts` if module is core

3. **Add Compliance Checks**
   - Register checks in `src/governance/compliance.ts`

4. **Document in Architecture**
   - Add module description to `notes/ARCHITECTURE_DRAFT.md`

## Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.

Instead:
1. Email security concerns to project maintainers
2. Provide detailed description
3. Allow time for patch development
4. Coordinate disclosure timing

## Community Guidelines

- Be respectful and inclusive
- Assume good intentions
- Provide constructive feedback
- Help others learn and grow

## Questions?

- Check existing [Issues](https://github.com/dshvvvshr/Prime-security/issues)
- Review [Architecture Documentation](./notes/ARCHITECTURE_DRAFT.md)
- Read [Research Foundations](./UNDER_PRESSURE_LOOMING.md)

---
# Contributing to Brave Search MCP Server

Thank you for your interest in contributing to the Brave Search MCP Server! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Prime-security.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Brave API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   ```

3. Run in development mode:
   ```bash
   npm run dev
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing

Before submitting a PR:

1. Ensure the code builds without errors: `npm run build`
2. Test the MCP server with a real API key
3. Verify all tools work correctly

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Ensure the code builds successfully

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (Node.js version, OS, etc.)

## Feature Requests

We welcome feature requests! Please:

- Check if the feature has already been requested
- Provide a clear use case
- Explain why the feature would be useful
- Be open to discussion and feedback

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
