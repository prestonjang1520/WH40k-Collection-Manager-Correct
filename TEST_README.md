# WH40K Collection Manager - Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the WH40K Collection Manager application, including unit tests for individual components, integration tests for user flows, and utility functions for data manipulation.

## Test Structure

```
src/
├── __tests__/
│   ├── Integration.test.js       # Full application integration tests
│   └── testUtils.js               # Common test utilities and helpers
├── components/__tests__/
│   ├── AddItemForm.test.js        # Tests for adding new items
│   ├── ArmyBuilder.test.js        # Tests for army building functionality  
│   └── CollectionList.test.js     # Tests for collection display and management
└── models/__tests__/
    └── ItemModel.test.js          # Tests for item data validation and utilities
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with coverage report
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test AddItemForm
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="army"
```

### Update snapshots
```bash
npm test -- -u
```

## Test Coverage Areas

### 1. **AddItemForm Component** (`AddItemForm.test.js`)
- Form rendering and field validation
- Input handling for all fields (name, faction, points, painted status, notes)
- Enhancement management (add/remove)
- Form submission and navigation
- Error handling for invalid inputs
- Required field validation

### 2. **ArmyBuilder Component** (`ArmyBuilder.test.js`)
- Display of available units from collection
- Adding units to army
- Model count updates
- Enhancement selection/deselection
- Point calculations (base + enhancements)
- Army list download functionality
- Unit removal from army
- Toast notifications
- Empty state handling

### 3. **CollectionList Component** (`CollectionList.test.js`)
- Collection display (empty and populated states)
- Item details rendering
- Sorting and filtering functionality
- Search capability
- Edit/Delete actions
- Statistics display
- Enhancement display
- Responsive design
- Accessibility features

### 4. **Item Model Utilities** (`ItemModel.test.js`)
- Item validation
  - Required fields
  - Data type validation
  - Enhancement structure validation
- Point calculations
  - Base points with model count
  - Enhancement points
  - Total calculations
- Data creation utilities
  - Item factory
  - Army unit creation
  - Default value handling
- Army list formatting

### 5. **Integration Tests** (`Integration.test.js`)
- Complete user flows
  - Add item → View in list → Edit → Delete
  - Build army from collection items
- Data persistence
  - localStorage save/load
  - Cross-page state management
- Navigation between routes
- Error handling scenarios
- Form validation

## Test Utilities (`testUtils.js`)

The test utilities provide helpful functions and factories for testing:

### Rendering Helpers
- `renderWithRouter()` - Render components with routing context
- `createLocalStorageMock()` - Mock localStorage for tests

### Data Factories
- `TestDataFactory.createItem()` - Create test items
- `TestDataFactory.createEnhancement()` - Create test enhancements
- `TestDataFactory.createArmyUnit()` - Create army units
- `TestDataFactory.createCollection()` - Create test collections

### Common Assertions
- `assertItemDisplayed()` - Check if item is displayed correctly
- `assertFormField()` - Verify form field values
- `assertEnhancementDisplayed()` - Check enhancement display

### Test Setup
- `TestSetup.beforeEach()` - Common test setup
- `TestSetup.setupLocalStorage()` - Initialize localStorage
- `TestSetup.mockConsole()` - Mock console methods

## Coverage Goals

The test suite aims for:
- **70%+ code coverage** across all metrics
- **100% coverage** of critical paths (data manipulation, calculations)
- **Comprehensive integration testing** of user workflows

## Best Practices

1. **Use data factories** instead of hardcoding test data
2. **Clear mocks** between tests to avoid interference
3. **Test user behavior** not implementation details
4. **Use descriptive test names** that explain what is being tested
5. **Group related tests** using `describe` blocks
6. **Mock external dependencies** (localStorage, routing)
7. **Test edge cases** and error conditions
8. **Maintain test isolation** - each test should be independent

## Debugging Tests

### View test output in detail
```bash
npm test -- --verbose
```

### Debug a specific test
```javascript
test.only('specific test to debug', () => {
  // This test will run in isolation
});
```

### Use debugging statements
```javascript
screen.debug(); // Print current DOM
screen.debug(element); // Print specific element
```

### Check what's available in the DOM
```javascript
screen.logTestingPlaygroundURL(); // Get testing playground link
```

## Common Issues and Solutions

### Issue: Tests failing due to async operations
**Solution**: Use `waitFor` or `findBy` queries
```javascript
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### Issue: Router errors in tests
**Solution**: Wrap components with MemoryRouter or use renderWithRouter utility

### Issue: localStorage not persisting
**Solution**: Use the provided localStorage mock in tests

### Issue: Form submission not working
**Solution**: Ensure all required fields are filled before submission

## Continuous Integration

The test suite is designed to run in CI environments. Recommended CI configuration:

```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '16'
    - run: npm ci
    - run: npm test -- --coverage --watchAll=false
```

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure new code has test coverage
3. Update existing tests if behavior changes
4. Run full test suite before submitting PR
5. Include test descriptions in PR

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing React Applications](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
