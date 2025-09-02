# 🤝 Contributing to ScriptAI

Thank you for your interest in contributing to ScriptAI! This guide will help you get started and understand our development process.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community Guidelines](#community-guidelines)
- [Getting Help](#getting-help)

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18.x or higher
- **pnpm** package manager
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint

### Quick Setup

1. **Fork the repository**
   - Go to [https://github.com/scriptaiapp/scriptai](https://github.com/scriptaiapp/scriptai)
   - Click the "Fork" button in the top right
   - Clone your fork locally

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/scriptai.git
   cd scriptai
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/scriptaiapp/scriptai.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Create the necessary environment files:

```bash
# Frontend environment
cp apps/web/.env.example apps/web/.env.local

# Backend environment
cp apps/api/.env.example apps/api/.env
```

**Required Environment Variables:**

Frontend (`apps/web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Backend (`apps/api/.env`):
```env
PORT=8000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_key
```

### 3. Start Development Servers

```bash
# Start all services
pnpm run dev

# Or start individual services
pnpm run dev --filter=web
pnpm run dev --filter=api
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:8000](http://localhost:8000)

## 🔄 Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

| Prefix | Description | Example |
|--------|-------------|---------|
| `feat/` | New features | `feat/add-dark-mode` |
| `fix/` | Bug fixes | `fix/script-generation-error` |
| `docs/` | Documentation | `docs/update-readme` |
| `style/` | Code style changes | `style/format-components` |
| `refactor/` | Code refactoring | `refactor/extract-hooks` |
| `test/` | Adding tests | `test/add-script-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |

### Creating a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create and switch to a new branch
git checkout -b feat/your-feature-name
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

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
```bash
feat(scripts): add tone selection to script generation
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
test(api): add unit tests for script endpoints
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type - use proper typing
- Use Zod for runtime validation

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Implement proper error boundaries

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use CSS variables for theming
- Ensure responsive design

### Code Organization

- Keep components small and focused
- Use proper file naming conventions
- Organize imports logically
- Add JSDoc comments for complex functions

### Example Component Structure

```typescript
// components/FeatureComponent.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FeatureComponentProps {
  title: string
  description?: string
  className?: string
}

/**
 * FeatureComponent - A reusable component for displaying features
 * @param props - Component props
 * @returns JSX element
 */
export function FeatureComponent({ 
  title, 
  description, 
  className 
}: FeatureComponentProps) {
  const [isActive, setIsActive] = useState(false)

  return (
    <div className={cn('p-4 border rounded-lg', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
      <Button 
        onClick={() => setIsActive(!isActive)}
        variant={isActive ? 'default' : 'outline'}
      >
        Toggle
      </Button>
    </div>
  )
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run E2E tests
pnpm run test:e2e

# Run tests for specific package
pnpm run test --filter=web
```

### Writing Tests

- Write unit tests for utilities and hooks
- Write integration tests for API endpoints
- Write E2E tests for critical user flows
- Aim for good test coverage

### Test Structure

```typescript
// __tests__/FeatureComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FeatureComponent } from '@/components/FeatureComponent'

describe('FeatureComponent', () => {
  it('renders with title', () => {
    render(<FeatureComponent title="Test Feature" />)
    expect(screen.getByText('Test Feature')).toBeInTheDocument()
  })

  it('toggles active state on button click', () => {
    render(<FeatureComponent title="Test Feature" />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    expect(button).toHaveClass('bg-primary')
    
    fireEvent.click(button)
    expect(button).toHaveClass('border-input')
  })
})
```

## 🔄 Pull Request Process

### Before Submitting a PR

1. **Ensure your code works**
   - All tests pass
   - No linting errors
   - Code is properly formatted

2. **Update documentation**
   - Update README if needed
   - Add JSDoc comments
   - Update API documentation

3. **Test your changes**
   - Test locally
   - Test different scenarios
   - Test edge cases

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code has been completed
- [ ] Code has been tested locally
- [ ] Tests have been added/updated
- [ ] Documentation has been updated
- [ ] PR description clearly describes the changes
- [ ] PR is linked to an issue (if applicable)
- [ ] All CI checks pass

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested my changes locally
- [ ] I have added tests for my changes
- [ ] All existing tests pass

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information or context.
```

## 🐛 Issue Guidelines

### Creating Issues

When creating an issue, please use the provided templates and include:

- **Clear title** describing the problem
- **Detailed description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment information** (OS, browser, etc.)
- **Screenshots or videos** (if applicable)

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 🤝 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) to understand our community standards.

### Communication

- Be respectful and inclusive
- Use clear and constructive language
- Help others learn and grow
- Give credit where credit is due

### Getting Help

If you need help with your contribution:

1. **Check existing documentation** - Start with the README and this guide
2. **Search existing issues** - Your question might already be answered
3. **Join our Discord** - [https://discord.gg/f6AG7kt7](https://discord.gg/f6AG7kt7)
4. **Create an issue** - Use the "Question" template

### Good First Issues

Looking for your first contribution? Check out issues labeled with `good first issue`:

- 🐛 Simple bug fixes
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Adding test coverage
- 🔧 Configuration improvements

## 🎉 Recognition

Contributors are recognized in several ways:

- **GitHub Contributors** - Your commits appear in the repository's contributors list
- **Release Notes** - Significant contributions are mentioned in release notes
- **Community Shoutouts** - Regular acknowledgments in our Discord community

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

Thank you for contributing to ScriptAI! Your contributions help make this project better for everyone. 🚀
