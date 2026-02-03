# Contributing to The One (eluno.org)

Thank you for your interest in contributing to this project! We welcome improvements, bug fixes, and thoughtful enhancements that align with the project's mission.

## 🎯 Project Mission

This project provides an accessible, modern reinterpretation of the Ra Material (Law of One) as narrative prose. Our goal is to maintain **fidelity to the source material** while making it approachable for contemporary readers.

## 🤝 How to Contribute

### Types of Contributions We Welcome

1. **Bug Fixes** — Technical issues, broken links, typos
2. **Documentation Improvements** — Clarifications, translations, examples
3. **Technical Enhancements** — Performance, accessibility, responsive design
4. **Content Quality** — Fact-checking against Ra Material source texts
5. **Translations** — Help with EN/PT translations (ES is authoritative)
6. **Audiobook** — Voice improvements, timing, technical quality

### Types of Contributions We Don't Accept

- **Doctrinal changes** that deviate from the Ra Material source
- **New interpretations** or personal philosophy additions
- **Marketing/SEO** optimizations that compromise content integrity
- **Third-party tracking** or analytics that compromise privacy

## 📋 Contribution Process

### 1. Before You Start

- **Check existing issues**: See if someone is already working on it
- **Open an issue first**: Discuss your proposed changes before investing time
- **Read the documentation**: Familiarize yourself with the project structure

### 2. Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/eluno.org.git
cd eluno.org

# Add upstream remote
git remote add upstream https://github.com/chuchurex/eluno.org.git
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

Requirements: Node.js v20+

### 4. Create a Branch

```bash
# Create a descriptive branch name
git checkout -b fix/broken-glossary-links
git checkout -b docs/improve-deployment-guide
git checkout -b feature/add-dark-mode
```

### 5. Make Your Changes

- Follow existing code style and conventions
- Test your changes locally (`npm run build`)
- Keep commits atomic and well-described
- Update relevant documentation

### 6. Test Your Changes

```bash
# Build the project
npm run build

# Check for errors
npm run dev
# Navigate to http://127.0.0.1:3002 and test your changes
```

### 7. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "fix: repair broken glossary links in chapter 4"
```

**Commit message format:**
- `fix:` — Bug fixes
- `feat:` — New features
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, no logic change)
- `refactor:` — Code refactoring
- `test:` — Test additions or fixes
- `chore:` — Build process or tooling changes

### 8. Push & Create Pull Request

```bash
# Push to your fork
git push origin fix/broken-glossary-links
```

Then create a Pull Request on GitHub with:
- **Clear title** describing the change
- **Description** explaining what and why
- **Screenshots** if visual changes are involved
- **Testing notes** describing how you tested

## 🔍 Code Review Process

1. A maintainer will review your PR within 1-2 weeks
2. You may be asked to make changes or clarifications
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged in the project

## 📝 Style Guidelines

### Code Style

- **JavaScript**: Use ES6+ features, prefer `const` over `let`
- **SCSS**: Follow BEM methodology for class naming
- **HTML**: Semantic, accessible markup
- **Indentation**: 2 spaces for JS/JSON, tabs for HTML/SCSS

### Content Style

- **Preserve source authority**: Every concept must trace to Ra Material
- **Maintain voice consistency**: Follow the Writing Protocol (see `docs/WRITING_PROTOCOL_V3.md`)
- **Technical terms**: Use established glossary terms (see `i18n/*/glossary.json`)
- **References**: Always include `{ref:}` citations for Ra quotes

### Documentation Style

- **Clear headings**: Use semantic hierarchy (H1 → H2 → H3)
- **Code blocks**: Include language specifiers (```bash, ```javascript)
- **Examples**: Provide concrete examples, not just abstract descriptions
- **Audience**: Write for developers familiar with Node.js

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: What happened vs. what you expected
2. **Steps to reproduce**: Detailed instructions
3. **Environment**: OS, Node version, browser (if applicable)
4. **Screenshots**: If visual bug
5. **Error messages**: Full stack traces if available

## 💡 Suggesting Enhancements

When suggesting enhancements:

1. **Use case**: Explain the problem you're solving
2. **Proposed solution**: Describe your approach
3. **Alternatives**: What other solutions did you consider?
4. **Impact**: Who benefits and how?

## 📚 Important Documentation

Before contributing, read:

- **[Development Guide](docs/DEVELOPMENT.md)** — Local setup and workflows
- **[Architecture](docs/ARCHITECTURE.md)** — Technical design decisions
- **[Writing Protocol](docs/WRITING_PROTOCOL_V3.md)** — Content guidelines
- **[AI Methodology](ai/README.md)** — How the book was created

## 🙏 Recognition

Contributors will be recognized in:
- Git commit history
- GitHub contributors page
- Project acknowledgments (if significant contribution)

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

**Content License**: Derived from Ra Material © L/L Research (authorized)
**Code License**: See LICENSE file

## 🆘 Getting Help

- **Questions?** Open a GitHub issue with the `question` label
- **Stuck?** Check existing issues or ask in your PR comments
- **Need context?** Read the AI methodology docs in the `ai/` folder

## 🌟 Thank You

Every contribution, no matter how small, helps make the Ra Material more accessible. Thank you for being part of this project!

---

*Last updated: January 13, 2026*
