# Code Review Implementation Checklist

Complete this to set up automated code reviews for TaskMeshAI.

## Phase 1: GitHub Actions Setup (30 min)

### Step 1: Create Workflow Directory
- [ ] Create `.github` directory
- [ ] Create `.github/workflows` directory
- [ ] Verify directories exist

### Step 2: Create Workflow File

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
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm exec tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

- [ ] File created at `.github/workflows/code-review.yml`
- [ ] Syntax verified (use YAML validator)
- [ ] Content copied exactly

### Step 3: Push to GitHub

```bash
git add .github/workflows/code-review.yml
git commit -m "Add GitHub Actions code review workflow"
git push
```

- [ ] Committed and pushed
- [ ] GitHub Actions tab shows workflow

### Step 4: Verify Workflow Runs

1. Go to GitHub repo → Actions tab
2. Should see "Code Review" workflow
3. Click on it to view details

- [ ] Workflow appears in Actions tab
- [ ] Runs on push/PR
- [ ] Shows test results

---

## Phase 2: Branch Protection (15 min)

### Step 1: Go to Repository Settings

1. GitHub repo → Settings (gear icon)
2. Scroll to "Code and automation"
3. Click "Branches"

- [ ] In Repository Settings
- [ ] Clicked "Branches"

### Step 2: Add Branch Protection Rule

1. Click "Add rule"
2. Branch name pattern: `main`
3. Enable these checks:
   - ✓ Require status checks to pass before merging
   - ✓ test
   - ✓ lint (if using ESLint)
4. Save

- [ ] Created rule for `main` branch
- [ ] Required status checks enabled
- [ ] Test check required

### Step 3: Test the Protection

1. Create new branch: `git checkout -b test-protection`
2. Make small change: `echo "test" > test.txt`
3. Commit and push
4. Create Pull Request on GitHub
5. Should see status checks running

- [ ] PR shows "Checks running"
- [ ] Merge button disabled until checks pass
- [ ] After tests pass, merge button enabled

---

## Phase 3: ESLint Setup (20 min)

### Step 1: Install ESLint

```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

- [ ] ESLint installed
- [ ] TypeScript parser installed
- [ ] TypeScript plugin installed

### Step 2: Create ESLint Config

Create `.eslintrc.json`:

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
  },
  "ignorePatterns": [
    "node_modules",
    ".next",
    "dist",
    "coverage"
  ]
}
```

- [ ] `.eslintrc.json` created
- [ ] Config copied exactly
- [ ] File is valid JSON

### Step 3: Test ESLint Locally

```bash
pnpm exec eslint . --ext .ts,.tsx
```

- [ ] Command runs without errors
- [ ] Shows any violations
- [ ] Can see which files have issues

### Step 4: Add Lint Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix"
  }
}
```

- [ ] Scripts added to `package.json`
- [ ] `pnpm lint` works
- [ ] `pnpm lint:fix` works

### Step 5: Add ESLint to GitHub Actions

Update `.github/workflows/code-review.yml` lint job:

```yaml
- name: Run ESLint
  run: pnpm exec eslint . --ext .ts,.tsx --max-warnings 0
```

- [ ] Added ESLint step to workflow
- [ ] Pushed to GitHub
- [ ] Workflow runs with linting

---

## Phase 4: Add Prettier (10 min)

### Step 1: Install Prettier

```bash
pnpm add -D prettier
```

- [ ] Prettier installed

### Step 2: Create Prettier Config

Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

- [ ] `.prettierrc` created
- [ ] Config matches project style

### Step 3: Add Prettier Scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- [ ] Scripts added to `package.json`
- [ ] `pnpm format` works
- [ ] `pnpm format:check` works

### Step 4: (Optional) Add Pre-commit Hook

```bash
pnpm add -D husky lint-staged
pnpm exec husky install
pnpm exec husky add .husky/pre-commit "pnpm lint-staged"
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"]
  }
}
```

- [ ] Husky installed
- [ ] Pre-commit hook created
- [ ] lint-staged configured
- [ ] `git commit` runs checks

---

## Phase 5: Code Coverage Tracking (15 min)

### Step 1: Verify Jest Config Includes Coverage

Check `jest.config.js`:

```javascript
module.exports = {
  // ...
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'agent/**/*.{ts,tsx}',
    '!**/*.test.ts',
    '!**/node_modules/**',
  ],
};
```

- [ ] Jest configured for coverage
- [ ] Coverage files generated after `pnpm test`

### Step 2: Connect to Codecov (Optional)

1. Go to https://codecov.io
2. Sign in with GitHub
3. Select repository
4. Get upload token

- [ ] Codecov account created
- [ ] Repository connected
- [ ] Token obtained

### Step 3: Add Codecov to GitHub Actions

Already in workflow file:

```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

- [ ] Coverage uploaded to Codecov
- [ ] Coverage dashboard available
- [ ] Badge can be added to README

---

## Phase 6: Verification

### Run Full Code Review Locally

```bash
# Type check
pnpm exec tsc --noEmit

# Lint
pnpm lint

# Format check
pnpm format:check

# Tests
pnpm test

# All together
pnpm run review
```

- [ ] Type check passes
- [ ] Lint passes (or can auto-fix)
- [ ] Format check passes
- [ ] Tests pass (75/75)
- [ ] Coverage > 60%

### Test on GitHub

1. Create new branch
2. Make a change that violates ESLint
3. Push and create PR
4. GitHub Actions should fail
5. Fix the issue
6. Push again
7. GitHub Actions should pass

- [ ] PR shows failing checks
- [ ] Can see what failed in Actions
- [ ] Fix resolves the issue
- [ ] Checks pass after fix
- [ ] Can merge to main

---

## Final Checklist

### Automation
- [ ] GitHub Actions workflow created
- [ ] Branch protection enabled
- [ ] Required checks set to pass
- [ ] Cannot merge without passing tests

### Code Quality
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Type checking enforced
- [ ] All files lint cleanly

### Testing
- [ ] 75 tests passing
- [ ] Coverage > 60%
- [ ] Coverage reports uploaded
- [ ] No test failures in CI

### Documentation
- [ ] README has badges
- [ ] Contributing guide updated
- [ ] Code review process documented
- [ ] Team knows about automation

### Local Development
- [ ] Pre-commit hooks working (optional)
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm test` passes
- [ ] `pnpm exec tsc --noEmit` passes

---

## Success Criteria

✅ All checks above complete

✅ Any PR that fails checks cannot be merged

✅ Any PR that passes checks can be merged quickly

✅ No manual testing needed for code quality

✅ Team gets immediate feedback on CI

✅ Prevents bugs from reaching main branch

---

## Next Steps

1. Complete this checklist
2. Create failing PR to test protection
3. Create passing PR to verify workflow
4. Add badges to README
5. Update CONTRIBUTING.md
6. Share process with team

---

## Helpful Commands

```bash
# Run everything
pnpm run review

# Just lint
pnpm lint
pnpm lint:fix

# Just format
pnpm format
pnpm format:check

# Just test
pnpm test

# Just type check
pnpm exec tsc --noEmit

# Verify setup
git status
pnpm list eslint
pnpm list prettier
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflow not running | Check `.github/workflows/` path and YAML syntax |
| Merge button disabled | Check what's failing in Actions tab |
| ESLint errors | Run `pnpm lint:fix` to auto-fix |
| Coverage too low | Add more tests or check coverage config |
| Pre-commit blocked commit | Run `pnpm lint:fix` locally |

---

## Done! 🎉

You now have:
- ✅ Automated testing on every push
- ✅ Required checks before merge
- ✅ Code quality enforcement
- ✅ Security scanning
- ✅ Coverage tracking
- ✅ Professional CI/CD pipeline

Your code is now protected from bad commits! 🛡️
