# Contributing to Claude Code Usage Dashboard

Thank you for your interest in contributing! This document provides guidelines for contributing to the Claude Code Usage Dashboard.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Be respectful, inclusive, and constructive. We aim to maintain a welcoming environment for all contributors.

## Getting Started

### Prerequisites

- Claude Code CLI installed and used at least once
- Node.js (v14 or higher)
- Python 3
- Git

### First Time Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/your-username/claude-code-dashboard.git
cd claude-code-dashboard

# 3. Install dependencies
npm install

# 4. Update your data
./update.sh

# 5. Start the development server
./serve.sh
```

## Development Setup

### Project Structure

```
claude-code-dashboard/
├── index.html              # Main dashboard (single-page app with embedded CSS/JS)
├── dashboard-common.js     # Shared utilities and formatters
├── build-session-cache.js  # SQLite session cache builder
├── aggregate-data.sh       # Data aggregation script
├── serve.sh                # Local server script
├── update.sh               # Data update script
├── package.json            # Node.js dependencies
├── .cache/                 # Session cache (gitignored)
└── .claude/                # Claude Code configuration
```

### Making Changes

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the [Code Style](#code-style) guidelines

3. **Test your changes**:
   ```bash
   # Update data and start server
   ./serve.sh
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

### Testing

- Test on the latest versions of Chrome, Firefox, and Safari
- Verify both light and dark themes work
- Check that data loads correctly with your own stats
- Ensure responsive design works on mobile viewport

## Code Style

### JavaScript (ES6+)

- Use **const/let** instead of **var**
- Use **template literals** for string interpolation
- Use **arrow functions** for callbacks
- **Indentation**: 4 spaces
- **Semicolons**: Required

```javascript
// Good
const formatNumber = (num) => {
    return num.toLocaleString();
};

// Avoid
var formatNumber = function(num) {
    return num.toLocaleString();
}
```

### Bash Scripts

- Use **4 spaces** for indentation
- Quote variables: `"$VARIABLE"`
- Use `set -e` for error handling
- Include comments for non-obvious logic

```bash
#!/bin/bash
set -e

SOURCE_FILE="$HOME/.claude/stats-cache.json"

if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: File not found"
    exit 1
fi
```

### HTML/CSS

- Use **lowercase** for tag names and attributes
- Use **double quotes** for attribute values
- Follow BEM-like naming for CSS classes when applicable
- Use CSS custom properties for theming

### General Guidelines

- **Keep it simple**: Avoid over-engineering
- **No frameworks**: This project uses vanilla HTML/CSS/JavaScript
- **Progressive enhancement**: Ensure basic functionality works without JavaScript
- **Accessibility**: Use semantic HTML, ARIA labels where needed

## Submitting Changes

### Pull Request Process

1. **Ensure your branch is up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what you changed and why
   - Screenshots for UI changes (if applicable)
   - Reference any related issues

### Pull Request Checklist

- [ ] Code follows the style guidelines
- [ ] Changes are tested locally
- [ ] Documentation is updated (if needed)
- [ ] Commit messages are clear and descriptive
- [ ] PR description explains the change

### Commit Message Format

Use clear, descriptive commit messages:

```
Add feature: brief description

More detailed explanation of what was changed and why.
- Specific change 1
- Specific change 2

Closes #123
```

## Reporting Issues

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Check the [Setup Guide](SETUP.md)** for common problems
3. **Verify you're using the latest version**

### Issue Report Template

```markdown
**Description**
Brief description of the issue

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js version: [e.g., v20.0.0]
- Python version: [e.g., 3.11.0]

**Screenshots**
If applicable, add screenshots

**Additional Context**
Any other relevant information
```

## Feature Requests

We welcome feature requests! Please:

1. **Search existing issues** first
2. **Describe the use case** clearly
3. **Explain why it would be useful**
4. **Consider if it fits the project scope** (personal analytics dashboard)

## Areas Where We Welcome Contributions

- **Bug fixes**
- **Performance improvements**
- **Additional visualizations**
- **Accessibility enhancements**
- **Documentation improvements**
- **Internationalization (i18n)**
- **New metric calculations**

## Questions?

Feel free to:
- Open an issue with the "question" label
- Start a discussion (if enabled)
- Check existing issues and discussions

Thank you for contributing! 🎉
