// src/__tests__/testUtils.js
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with necessary providers
 */
export const renderWithRouter = (ui, { route = '/', ...renderOptions } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>,
    renderOptions
  );
};

/**
 * Mock localStorage implementation for tests
 */
export const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    // Helper method to set initial data
    __setData: (data) => {
      store = { ...data };
    },
    // Helper method to get all data
    __getData: () => ({ ...store })
  };
};

/**
 * Factory functions for creating test data
 */
export const TestDataFactory = {
  createItem: (overrides = {}) => ({
    id: Date.now(),
    name: 'Test Unit',
    faction: 'Test Faction',
    basePoints: 100,
    painted: false,
    notes: 'Test notes',
    enhancements: [],
    ...overrides
  }),

  createEnhancement: (overrides = {}) => ({
    name: 'Test Enhancement',
    points: 10,
    ...overrides
  }),

  createArmyUnit: (overrides = {}) => ({
    ...TestDataFactory.createItem(),
    modelCount: 1,
    selectedEnhancements: [],
    ...overrides
  }),

  createCollection: (size = 3) => {
    const factions = ['Space Marines', 'Necrons', 'Orks'];
    return Array.from({ length: size }, (_, i) => 
      TestDataFactory.createItem({
        id: i + 1,
        name: `Unit ${i + 1}`,
        faction: factions[i % factions.length],
        basePoints: (i + 1) * 50,
        painted: i % 2 === 0,
        enhancements: i === 0 ? [
          TestDataFactory.createEnhancement({ name: 'Enhancement A', points: 10 }),
          TestDataFactory.createEnhancement({ name: 'Enhancement B', points: 15 })
        ] : []
      })
    );
  }
};

/**
 * Common assertions for testing
 */
export const CommonAssertions = {
  assertItemDisplayed: (item, screen) => {
    expect(screen.getByText(item.name)).toBeInTheDocument();
    if (item.faction) {
      expect(screen.getByText(new RegExp(item.faction))).toBeInTheDocument();
    }
  },

  assertFormField: (screen, labelText, expectedValue) => {
    const field = screen.getByLabelText(labelText);
    expect(field).toHaveValue(expectedValue);
  },

  assertEnhancementDisplayed: (enhancement, screen) => {
    expect(screen.getByText(new RegExp(enhancement.name))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${enhancement.points}`))).toBeInTheDocument();
  }
};

/**
 * Wait utilities
 */
export const WaitUtils = {
  waitForLocalStorage: async (key, expectedValue, timeout = 3000) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const stored = localStorage.getItem(key);
      if (stored === expectedValue) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
  }
};

/**
 * Mock event creators
 */
export const createChangeEvent = (value) => ({
  target: { value }
});

export const createCheckEvent = (checked) => ({
  target: { checked }
});

/**
 * Faction data for tests
 */
export const testFactions = [
  'Space Marines',
  'Necrons',
  'Orks',
  'Chaos Space Marines',
  "T'au Empire",
  'Tyranids'
];

/**
 * Setup and teardown helpers
 */
export const TestSetup = {
  beforeEach: () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear localStorage
    if (window.localStorage && window.localStorage.clear) {
      window.localStorage.clear();
    }
    
    // Reset document body
    document.body.innerHTML = '';
  },

  setupLocalStorage: (data = {}) => {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  },

  mockConsole: () => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    beforeAll(() => {
      console.error = jest.fn();
      console.warn = jest.fn();
    });
    
    afterAll(() => {
      console.error = originalError;
      console.warn = originalWarn;
    });
  }
};

/**
 * Custom matchers
 */
export const customMatchers = {
  toHaveValidItem: (received) => {
    const requiredFields = ['name', 'faction', 'basePoints'];
    const hasAllFields = requiredFields.every(field => 
      received.hasOwnProperty(field) && received[field] !== undefined
    );
    
    return {
      pass: hasAllFields,
      message: () => 
        `Expected item to have all required fields: ${requiredFields.join(', ')}`
    };
  },

  toHaveValidEnhancement: (received) => {
    const hasName = received.hasOwnProperty('name') && received.name !== '';
    const hasValidPoints = received.hasOwnProperty('points') && 
                          typeof received.points === 'number' && 
                          received.points >= 0;
    
    return {
      pass: hasName && hasValidPoints,
      message: () => 
        `Expected enhancement to have valid name and points`
    };
  }
};

// Export everything as default for convenience
export default {
  renderWithRouter,
  createLocalStorageMock,
  TestDataFactory,
  CommonAssertions,
  WaitUtils,
  createChangeEvent,
  createCheckEvent,
  testFactions,
  TestSetup,
  customMatchers
};
