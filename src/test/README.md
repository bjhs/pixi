# Testing Setup

This project uses Vitest as the testing framework with Vue Testing Library for component testing.

## Technologies

- **Vitest**: Fast unit test runner built for Vite
- **Vue Testing Library**: Simple and complete testing utilities for Vue components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@pinia/testing**: Testing utilities for Pinia stores
- **jsdom**: DOM implementation for testing environment

## Test Structure

```
src/
├── __tests__/           # General unit tests
├── components/
│   └── __tests__/       # Component tests
├── stores/
│   └── __tests__/       # Store tests
├── utils/
│   └── __tests__/       # Utility function tests
└── views/
    └── __tests__/       # View component tests

tests/
├── integration/         # Integration tests
└── e2e/                # End-to-end tests (if added)
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Writing Tests

### Store Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have correct initial state', () => {
    const authStore = useAuthStore()
    expect(authStore.user).toBeNull()
  })
})
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestWrapper } from '@/test/setup'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, createTestWrapper(MyComponent))
    expect(wrapper.text()).toContain('Expected text')
  })
})
```

### Utility Function Tests

```typescript
import { describe, it, expect } from 'vitest'
import { myUtilFunction } from '../myUtils'

describe('myUtilFunction', () => {
  it('should return expected result', () => {
    expect(myUtilFunction('input')).toBe('expected output')
  })
})
```

## Test Configuration

- **vitest.config.ts**: Main Vitest configuration
- **src/test/setup.ts**: Global test setup and mocks
- **tsconfig.test.json**: TypeScript configuration for tests

## Mocks and Helpers

The test setup includes:

- **Vuetify components**: Fully configured for testing
- **Pinia stores**: Testing utilities with spy support
- **Vue Router**: Router mocks and navigation testing
- **localStorage**: Mocked for consistent testing
- **window.matchMedia**: Mocked for responsive testing
- **ResizeObserver/IntersectionObserver**: Mocked for compatibility

## Best Practices

1. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases
2. **Descriptive test names**: Use clear, descriptive test names that explain what is being tested
3. **Test isolation**: Each test should be independent and not rely on other tests
4. **Mock external dependencies**: Mock API calls, external libraries, and browser APIs
5. **Test behavior, not implementation**: Focus on testing what the code does, not how it does it
6. **Use beforeEach for setup**: Use beforeEach to set up common test state
7. **Clean up after tests**: Ensure tests don't leak state or side effects

## Coverage Reports

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`. The reports include:

- **Text summary**: In terminal output
- **HTML report**: `coverage/index.html`
- **JSON report**: `coverage/coverage-final.json`

## Debugging Tests

- Use `console.log()` in tests for debugging
- Use `wrapper.html()` to inspect component DOM
- Use Vitest UI for interactive debugging: `npm run test:ui`
- Use `--reporter=verbose` for detailed test output