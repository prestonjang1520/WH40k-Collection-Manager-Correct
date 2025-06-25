import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArmyBuilder from './ArmyBuilder';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock URL methods for download functionality
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Save the original document.createElement method
const originalCreateElement = document.createElement.bind(document);
let mockAnchor;

beforeAll(() => {
  document.createElement = (tagName, options) => {
    if (tagName === 'a') {
      mockAnchor = originalCreateElement(tagName, options); // create real <a> element
      mockAnchor.click = jest.fn(); // mock click on this element
      return mockAnchor;
    }
    return originalCreateElement(tagName, options);
  };
});

afterAll(() => {
  // Restore original method after all tests complete
  document.createElement = originalCreateElement;
});

describe('ArmyBuilder', () => {
  let mockSetArmyList;

  const mockCollection = [
    {
      id: 1,
      name: 'Space Marine Captain',
      faction: 'Space Marines',
      basePoints: 100,
      painted: true,
      notes: 'HQ unit',
      enhancements: [
        { name: 'Power Sword', points: 10 },
        { name: 'Storm Shield', points: 15 },
      ],
    },
    {
      id: 2,
      name: 'Tactical Squad',
      faction: 'Space Marines',
      basePoints: 90,
      painted: false,
      notes: 'Troops choice',
      enhancements: [],
    },
    {
      id: 3,
      name: 'Necron Warriors',
      faction: 'Necrons',
      basePoints: 120,
      painted: true,
      notes: 'Core troops',
      enhancements: [{ name: 'Reanimation Protocols', points: 5 }],
    },
  ];

  beforeEach(() => {
    mockSetArmyList = jest.fn();
  });

  const renderArmyBuilder = (armyList = []) =>
    render(
      <MemoryRouter>
        <ArmyBuilder
          collection={mockCollection}
          armyList={armyList}
          setArmyList={mockSetArmyList}
        />
      </MemoryRouter>
    );

  test('minimal render works', () => {
    render(
      <MemoryRouter>
        <div>Hello World</div>
      </MemoryRouter>
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('renders Army Builder interface', () => {
    renderArmyBuilder();

    expect(screen.getByText('Army Builder')).toBeInTheDocument();
    expect(screen.getByText('Available Units')).toBeInTheDocument();
    expect(screen.getByText('Your Army')).toBeInTheDocument();
  });

  test('displays all available units from collection', () => {
    renderArmyBuilder();

    expect(
      screen.getByText('Space Marine Captain (Space Marines)')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tactical Squad (Space Marines)')
    ).toBeInTheDocument();
    expect(screen.getByText('Necron Warriors (Necrons)')).toBeInTheDocument();
  });

  test('shows empty army message when no units added', () => {
    renderArmyBuilder();

    expect(
      screen.getByText('Add units from the left to build your army.')
    ).toBeInTheDocument();
  });

  test('adds unit to army when Add button clicked', async () => {
    renderArmyBuilder();

    const addButtons = screen.getAllByRole('button', { name: /add to army/i });
    fireEvent.click(addButtons[0]); // Add Space Marine Captain

    await waitFor(() => {
      expect(mockSetArmyList).toHaveBeenCalledWith(expect.any(Function));
    });

    const updateFunction = mockSetArmyList.mock.calls[0][0];
    const newArmyList = updateFunction([]);

    expect(newArmyList).toHaveLength(1);
    expect(newArmyList[0]).toMatchObject({
      name: 'Space Marine Captain',
      faction: 'Space Marines',
      basePoints: 100,
      modelCount: 1,
      selectedEnhancements: [],
    });
  });

  test('displays units in army list', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    expect(screen.queryByText('Add units from the left to build your army.')).not.toBeInTheDocument();
    expect(screen.getByText(/Space Marine Captain - Points:/)).toBeInTheDocument();
  });

  test('updates model count', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    const modelCountInput = screen.getByLabelText('Model Count');
    fireEvent.change(modelCountInput, { target: { value: '5' } });

    expect(mockSetArmyList).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = mockSetArmyList.mock.calls[0][0];
    const newArmyList = updateFunction(armyList);

    expect(newArmyList[0].modelCount).toBe(5);
  });

  test('calculates points correctly without enhancements', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 3,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    // Base points (100) * model count (3) = 300
    expect(screen.getByText('Space Marine Captain - Points: 300')).toBeInTheDocument();
  });

  test('toggles enhancements', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    const powerSwordCheckbox = screen.getByLabelText('Power Sword (10 pts)');
    fireEvent.click(powerSwordCheckbox);

    expect(mockSetArmyList).toHaveBeenCalled();

    const updateFunction = mockSetArmyList.mock.calls[0][0];
    const newArmyList = updateFunction(armyList);

    expect(newArmyList[0].selectedEnhancements).toContain('Power Sword');
  });

  test('calculates points correctly with enhancements', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 2,
        selectedEnhancements: ['Power Sword', 'Storm Shield']
      }
    ];

    renderArmyBuilder(armyList);

    // Base points (100) * model count (2) + Power Sword (10) + Storm Shield (15) = 225
    expect(screen.getByText('Space Marine Captain - Points: 225')).toBeInTheDocument();
  });

  test('removes unit from army', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: []
      },
      {
        ...mockCollection[1],
        modelCount: 1,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]); // Remove first unit

    expect(mockSetArmyList).toHaveBeenCalled();

    const updateFunction = mockSetArmyList.mock.calls[0][0];
    const newArmyList = updateFunction(armyList);

    expect(newArmyList).toHaveLength(1);
    expect(newArmyList[0].name).toBe('Tactical Squad');
  });

  test('handles units without enhancements', () => {
    const armyList = [
      {
        ...mockCollection[1], // Tactical Squad has no enhancements
        modelCount: 1,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    expect(screen.getByText('No enhancements available.')).toBeInTheDocument();
  });

  test('download button is disabled with empty army', () => {
    renderArmyBuilder();

    const downloadButton = screen.getByRole('button', { name: /download list/i });
    expect(downloadButton).toBeDisabled();
  });

  test('download button is enabled with units in army', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    const downloadButton = screen.getByRole('button', { name: /download list/i });
    expect(downloadButton).not.toBeDisabled();
  });

  test('downloads army list as text file', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 2,
        selectedEnhancements: ['Power Sword']
      },
      {
        ...mockCollection[2],
        modelCount: 10,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    const downloadButton = screen.getByRole('button', { name: /download list/i });
    fireEvent.click(downloadButton);

    // Now check the mocked anchor, not querying the DOM
    expect(mockAnchor).toBeDefined();
    expect(mockAnchor.click).toHaveBeenCalled();

    // Also check URL.createObjectURL and revokeObjectURL were called
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('shows toast notification when unit added', async () => {
    renderArmyBuilder();

    const addButtons = screen.getAllByRole('button', { name: /add to army/i });
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Space Marine Captain added to army!')).toBeInTheDocument();
    });
  });

  test('can add multiple copies of same unit', () => {
    renderArmyBuilder();

    const addButtons = screen.getAllByRole('button', { name: /add to army/i });

    // Add same unit twice
    fireEvent.click(addButtons[0]);
    fireEvent.click(addButtons[0]);

    expect(mockSetArmyList).toHaveBeenCalledTimes(2);
  });

  test('handles model count edge cases', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: []
      }
    ];

    renderArmyBuilder(armyList);

    const modelCountInput = screen.getByLabelText('Model Count');

    // Test invalid input (should default to 1)
    fireEvent.change(modelCountInput, { target: { value: '' } });

    const updateFunction = mockSetArmyList.mock.calls[0][0];
    const newArmyList = updateFunction(armyList);

    expect(newArmyList[0].modelCount).toBe(1);
  });

  test('deselects enhancement when clicked again', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: ['Power Sword']
      }
    ];

    renderArmyBuilder(armyList);

    const powerSwordCheckbox = screen.getByLabelText('Power Sword (10 pts)');
    expect(powerSwordCheckbox).toBeChecked();

    fireEvent.click(powerSwordCheckbox);

    const updateFunction = mockSetArmyList.mock.calls[0][0];
    const newArmyList = updateFunction(armyList);

    expect(newArmyList[0].selectedEnhancements).not.toContain('Power Sword');
  });

  test('maintains enhancement state correctly', () => {
    const armyList = [
      {
        ...mockCollection[0],
        modelCount: 1,
        selectedEnhancements: ['Power Sword']
      }
    ];

    renderArmyBuilder(armyList);

    // Add another enhancement
    const stormShieldCheckbox = screen.getByLabelText('Storm Shield (15 pts)');
    fireEvent.click(stormShieldCheckbox);

    const updateFunction = mockSetArmyList.mock.calls[0][0];
    const newArmyList = updateFunction(armyList);

    expect(newArmyList[0].selectedEnhancements).toContain('Power Sword');
    expect(newArmyList[0].selectedEnhancements).toContain('Storm Shield');
    expect(newArmyList[0].selectedEnhancements).toHaveLength(2);
  });
});
