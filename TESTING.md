# Testing Setup for Nuxt Project

This project uses Jest for testing with Vue Test Utils for component testing.

## Setup

The testing setup includes:

- **Jest** - JavaScript testing framework
- **@vue/test-utils** - Vue component testing utilities
- **jsdom** - DOM environment for testing
- **Babel** - JavaScript transpiler for modern syntax

## Configuration Files

- `jest.config.cjs` - Jest configuration
- `jest.setup.cjs` - Jest setup file with global mocks
- `babel.config.cjs` - Babel configuration for Jest
- `__mocks__/fileMock.js` - Mock for static assets

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

```
tests/
├── example.test.js          # Basic Jest examples
└── components/
    └── Booking.test.js      # Component testing examples
```

## Writing Tests

### Basic Jest Test
```javascript
describe('Example Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Vue Component Test (when ready)
```javascript
const { mount } = require('@vue/test-utils')

describe('Vue Component Test', () => {
  it('should render component correctly', () => {
    const wrapper = mount(YourComponent, {
      props: {
        title: 'Test Title'
      }
    })
    
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.exists()).toBe(true)
  })
})
```

## Global Mocks

The setup includes mocks for:
- `window.matchMedia`
- `IntersectionObserver`
- Vue 3 global functions
- Static assets (images, CSS, etc.)

## Coverage

Coverage reports are generated in the `coverage/` directory and show:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## Notes

- Tests use CommonJS syntax due to Jest configuration
- Vue Test Utils are available but require proper component setup
- The setup is ready for both unit and component testing
