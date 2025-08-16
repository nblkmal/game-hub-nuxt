// Jest setup file
const { config } = require('@vue/test-utils')

// Global test configuration
config.global.stubs = {
  // Stub Nuxt components that might not be available in test environment
  'NuxtLink': true,
  'NuxtPage': true,
  'NuxtLayout': true,
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock Vue 3 for test environment
global.Vue = {
  createApp: jest.fn(),
  h: jest.fn(),
  ref: jest.fn(),
  reactive: jest.fn(),
  computed: jest.fn(),
  watch: jest.fn(),
  onMounted: jest.fn(),
  onUnmounted: jest.fn(),
}
