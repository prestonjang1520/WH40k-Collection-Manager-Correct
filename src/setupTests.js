import '@testing-library/jest-dom';

const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => (store[key] || null)),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});
