# Contributing to Ella-Rayne

Thank you for your interest in contributing to Ella-Rayne (Gemini OS)! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Quality Standards](#code-quality-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Be respectful, inclusive, and professional in all interactions. We aim to maintain a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Ella-Rayne.git
   cd Ella-Rayne
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/mrdannyclark82/Ella-Rayne.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Check formatting
npm run format:check

# Type check
npm run type-check

# Build the project
npm run build
```

### 4. Commit Your Changes

We follow conventional commit messages:

```bash
git add .
git commit -m "feat: add new feature"
```

**Commit Message Format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit the PR

## Code Quality Standards

### ESLint Rules

All code must pass ESLint checks:

```bash
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Prettier Formatting

Code must be formatted with Prettier:

```bash
npm run format

# Check formatting
npm run format:check
```

### TypeScript

- Use TypeScript for all new code
- Maintain type safety
- No `any` types without justification
- Add JSDoc comments for public APIs

### Code Style

- **Naming Conventions:**
  - Components: PascalCase (e.g., `UserProfile`)
  - Functions/Variables: camelCase (e.g., `handleClick`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_KEY`)
  - Files: PascalCase for components, camelCase for utilities

- **File Organization:**
  - One component per file
  - Group related code together
  - Use barrel exports (index.ts) when appropriate

- **Comments:**
  - Explain "why" not "what"
  - Use JSDoc for functions and components
  - Keep comments up-to-date

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] ESLint passes
- [ ] Prettier formatting applied
- [ ] TypeScript type checking passes
- [ ] Documentation updated
- [ ] No console.log statements (use console.error/warn if needed)

### PR Checklist

Your PR should include:

1. **Clear Title**
   - Use conventional commit format
   - Be specific and descriptive

2. **Description**
   - What changes were made?
   - Why were these changes necessary?
   - How were the changes tested?
   - Any breaking changes?

3. **Screenshots** (if UI changes)
   - Before and after images
   - Different screen sizes if responsive

4. **Related Issues**
   - Link to related issues
   - Use keywords: "Fixes #123" or "Closes #456"

### Review Process

1. **Automated Checks**
   - CI/CD pipeline must pass
   - CodeQL security scan
   - Dependency review
   - Build verification

2. **Code Review**
   - At least one maintainer approval required
   - Address all review comments
   - Update PR based on feedback

3. **Merge**
   - Maintainers will merge approved PRs
   - Squash and merge is preferred
   - Delete branch after merge

## Reporting Issues

### Bug Reports

Use the bug report template and include:

- **Description:** Clear description of the bug
- **Steps to Reproduce:** Detailed steps
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:**
  - OS and version
  - Node.js version
  - Browser and version
- **Screenshots:** If applicable
- **Additional Context:** Any other relevant information

### Feature Requests

Use the feature request template and include:

- **Description:** Clear description of the feature
- **Use Case:** Why is this feature needed?
- **Proposed Solution:** How should it work?
- **Alternatives:** Any alternative solutions considered?
- **Additional Context:** Mockups, examples, etc.

## Development Tips

### Running Specific Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

### Debugging

1. **Browser DevTools**
   - Use React DevTools extension
   - Check Console for errors
   - Use Network tab for API calls

2. **VS Code Debugging**
   - Set breakpoints in code
   - Use debugger statement
   - Check Debug Console

### Common Issues

**Problem:** Dependencies not installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem:** Build errors
```bash
# Clean build and rebuild
rm -rf dist
npm run build
```

**Problem:** Linting errors
```bash
# Auto-fix most issues
npm run lint:fix
npm run format
```

## Project Structure

```
ella-rayne/
├── src/                    # Source files
│   ├── App.tsx            # Main app component
│   ├── App.css            # App styles
│   ├── main.tsx           # Entry point
│   ├── index.css          # Global styles
│   └── assets/            # Static assets
├── .github/
│   └── workflows/         # CI/CD workflows
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies
├── .eslintrc.json         # ESLint config
├── .prettierrc.json       # Prettier config
└── README.md              # Documentation
```

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

## Questions?

- Open an issue for bugs or features
- Start a discussion for general questions
- Check existing issues and discussions first

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Ella-Rayne! 🎉**
