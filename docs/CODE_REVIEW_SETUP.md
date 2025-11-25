# Automated Code Review Setup Guide

This guide explains how to set up automated code reviews for TaskMeshAI using industry-standard tools.

## Overview

Automated code reviews check for:
- ✅ Code quality issues
- ✅ Security vulnerabilities
- ✅ Performance problems
- ✅ Test coverage
- ✅ Best practices
- ✅ Type safety
- ✅ Linting & formatting

---

## Option 1: GitHub Actions (Recommended) ⭐

### What It Does

Automatically runs on every pull request:
1. Linter (ESLint)
2. Type checker (TypeScript)
3. Test suite
4. Code coverage
5. Security scan

### Setup (15 minutes)

#### Step 1: Create Workflow File

Create `.github/workflows/code-review.yml`:

```yaml
name: Code Review

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run ESLint
        run: pnpm exec eslint . --ext .ts,.tsx --max-warnings 0
      
      - name: Type check
        run: pnpm exec tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        continue-on-error: true
```

#### Step 2: Push to GitHub

```bash
mkdir -p .github/workflows
# Create code-review.yml (see above)
git add .github/workflows/code-review.yml
git commit -m "Add GitHub Actions code review workflow"
git push
```

#### Step 3: Go to Repository Settings

1. GitHub → Your repo → Settings
2. Branch protection rules
3. Add rule for `main` branch
4. Require status checks to pass:
   - ✓ lint
   - ✓ test
   - ✓ security

**Result:** All PRs must pass checks before merging!

---

## Option 2: CodeQL (GitHub-Native) 🔒

### What It Does

Scans for security vulnerabilities and code quality issues automatically.

### Setup (5 minutes)

1. Go to GitHub repo → Settings → Code security and analysis
2. Enable "CodeQL analysis"
3. Done! GitHub runs it automatically

### How It Works

- Runs on every push and PR
- Scans for:
  - SQL injection
  - Cross-site scripting (XSS)
  - Path traversal
  - Weak cryptography
  - Common JavaScript bugs
- Shows results in "Security" tab

---

## Option 3: Third-Party Services

### Sonarcloud (Code Quality)

**Best for:** Detailed code quality metrics

1. Go to https://sonarcloud.io
2. Sign in with GitHub
3. Analyze repository
4. Add badge to README

**Checks:**
- Code coverage
- Maintainability
- Reliability
- Security

### Dependabot (Dependency Updates)

**Best for:** Keeping dependencies secure

1. GitHub → Settings → Code security
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"

**Features:**
- Notifies of vulnerabilities
- Auto-creates PRs with fixes
- Can auto-merge safe updates

### Codacy (Code Review)

**Best for:** Detailed per-PR feedback

1. Go to https://www.codacy.com
2. Connect GitHub account
3. Add repository
4. Done! Reviews every PR

**Feedback on:**
- Code complexity
- Duplicate code
- Test coverage
- Performance issues

---

## Option 4: Pre-Commit Hooks (Local)

Run checks before committing (prevents bad commits).

### Setup (5 minutes)

#### Step 1: Install husky

```bash
pnpm add -D husky
pnpm exec husky install
```

#### Step 2: Create pre-commit hook

```bash
pnpm exec husky add .husky/pre-commit "pnpm lint-staged"
```

#### Step 3: Configure lint-staged

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"]
  }
}
```

#### Step 4: Test it

```bash
# Make a change
echo "test" > test.txt
git add test.txt

# Try to commit (will run checks first)
git commit -m "test"

# If checks fail, commit is blocked
```

### Benefits

✅ Catch issues before pushing  
✅ Automatic formatting  
✅ Local feedback loop  

---

## Current Project Setup

### What We Already Have

✅ **TypeScript** - Type checking
✅ **ESLint** - Linting (if configured)
✅ **Jest** - Testing (75 tests)
✅ **package.json** - Dependencies tracked

### What's Missing

❌ **GitHub Actions** - Automated CI/CD
❌ **ESLint config** - Linting rules
❌ **Pre-commit hooks** - Local checks
❌ **Code coverage tracking** - Codecov/Sonarcloud
❌ **Security scanning** - CodeQL/Snyk

---

## Quick Implementation Plan

### Phase 1: GitHub Actions (30 min)

1. Create `.github/workflows/code-review.yml`
2. Add test and type-check steps
3. Enable branch protection
4. Push and test with PR

### Phase 2: ESLint Setup (15 min)

1. Install ESLint: `pnpm add -D eslint @typescript-eslint/eslint-plugin`
2. Create `.eslintrc.json`
3. Add to GitHub Actions workflow
4. Test locally: `pnpm exec eslint .`

### Phase 3: Pre-commit Hooks (15 min)

1. Install husky: `pnpm add -D husky`
2. Setup: `pnpm exec husky install`
3. Add pre-commit hook
4. Test locally

### Phase 4: Codecov (10 min)

1. Connect to https://codecov.io
2. Add step to GitHub Actions
3. Add coverage badge to README

---

## Example Workflow

```
Developer creates branch
    ↓
Makes code changes
    ↓
Runs: git commit
    ↓
Pre-commit hooks run (local)
  - ESLint formatting
  - Type checking
  - Tests
    ↓
If fails: commit blocked (developer fixes locally)
If passes: commit succeeds
    ↓
Developer pushes to GitHub
    ↓
GitHub Actions runs (CI/CD)
  - Full lint
  - Full test suite
  - Security scan
  - Coverage check
    ↓
Results shown on PR
    ↓
Maintainer reviews (can also be automated)
    ↓
If all checks pass: can merge
If checks fail: must fix before merge
```

---

## Files to Create

### `.github/workflows/code-review.yml`
```yaml
[See full content above]
```

### `.eslintrc.json`
```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off"
  }
}
```

### `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### `.prettierignore`
```
node_modules
.next
dist
coverage
```

---

## Commands to Add to package.json

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "review": "pnpm lint && pnpm type-check && pnpm test"
  }
}
```

---

## Monitoring & Reporting

### GitHub Dashboard

- Go to repo → Actions tab
- See all workflow runs
- View detailed logs
- See pass/fail status

### Pull Request Status

```
✅ All checks passed
  ✓ test (successful)
  ✓ lint (successful)
  ✓ type-check (successful)
  
Ready to merge!
```

### Badge for README

```markdown
[![Tests](https://github.com/YOUR_REPO/actions/workflows/code-review.yml/badge.svg)](https://github.com/YOUR_REPO/actions)
```

---

## Best Practices

### ✅ Do

- [ ] Make checks required before merge
- [ ] Keep checks fast (<5 min)
- [ ] Fail on warnings (strict mode)
- [ ] Show detailed error messages
- [ ] Auto-fix formatting issues
- [ ] Require passing tests
- [ ] Check code coverage
- [ ] Document why rules exist

### ❌ Don't

- [ ] Ignore CI failures
- [ ] Disable checks to merge
- [ ] Make checks too slow
- [ ] Over-configure rules
- [ ] Ignore security warnings
- [ ] Merge without tests passing
- [ ] Add to main without PR

---

## Troubleshooting

### GitHub Actions Won't Run

**Problem:** Workflow file not executing

**Solution:**
1. Check `.github/workflows/code-review.yml` path
2. Verify file syntax (use YAML validator)
3. Check if branch protection is enabled
4. Manually trigger via Actions tab

### ESLint Errors in CI But Not Local

**Problem:** Different versions or configs

**Solution:**
```bash
# Use exact same version
pnpm list eslint

# Clear cache
pnpm exec eslint --cache-location .eslintcache --cache-strategy content
```

### Tests Pass Locally But Fail in CI

**Problem:** Environment differences

**Solution:**
```bash
# Run exactly as CI does
NODE_ENV=test pnpm test
```

---

## Next Level: Code Review Automation

### Automatic Comments on PR

```yaml
- name: Comment test results
  uses: actions/github-script@v6
  if: always()
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '✅ Code review passed!\n- Tests: 75/75\n- Coverage: 65%'
      })
```

### Auto-Fix and Commit

```yaml
- name: Auto-fix and commit
  if: failure()
  run: |
    pnpm lint:fix
    git config user.name "bot"
    git config user.email "bot@taskmesh.ai"
    git add .
    git commit -m "chore: auto-fix linting issues"
    git push
```

### Conditional Merge

Block merge if coverage drops:

```yaml
- name: Check coverage
  run: |
    COVERAGE=$(pnpm exec jest --coverage --silent | grep -o '[0-9.]*%' | head -1)
    if (( $(echo "$COVERAGE < 60" | bc -l) )); then
      echo "Coverage too low: $COVERAGE"
      exit 1
    fi
```

---

## Implementation Priority

### Tier 1 (Must Have) - Week 1
- [ ] GitHub Actions workflow
- [ ] Branch protection rules
- [ ] ESLint configuration

### Tier 2 (Should Have) - Week 2
- [ ] Pre-commit hooks
- [ ] Code coverage tracking
- [ ] Security scanning

### Tier 3 (Nice to Have) - Week 3
- [ ] Codecov integration
- [ ] Auto-fix commits
- [ ] Detailed PR comments

---

## Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **ESLint:** https://eslint.org/
- **Prettier:** https://prettier.io/
- **Husky:** https://typicode.github.io/husky/
- **Codecov:** https://codecov.io/
- **CodeQL:** https://codeql.github.com/

---

## Questions to Consider

1. **How strict?** Start permissive, tighten over time
2. **Auto-fix?** Should linter auto-fix issues?
3. **Required checks?** Block merge if checks fail?
4. **Coverage threshold?** Require 60%? 70%?
5. **Review needed?** Require human review + checks?
6. **Who approves?** Maintainers? Code owners?

---

## Next Steps

1. Review this guide with team
2. Decide which tools to use
3. Create GitHub Actions workflow
4. Test with a PR
5. Enable branch protection
6. Document in team guidelines

This will significantly improve code quality and prevent bugs from reaching main! 🚀
