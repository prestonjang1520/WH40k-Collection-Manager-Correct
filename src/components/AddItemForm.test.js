// src/components/__tests__/AddItemForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddItemForm from './AddItemForm';
import '@testing-library/jest-dom';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('AddItemForm', () => {
  let mockSetCollection;

  beforeEach(() => {
    mockSetCollection = jest.fn();
    mockedNavigate.mockClear();
  });

  const renderAddItemForm = () => {
    return render(
      <BrowserRouter>
        <AddItemForm setCollection={mockSetCollection} />
      </BrowserRouter>
    );
  };

  test('renders form with all required fields', () => {
    renderAddItemForm();

    // Check for all form fields
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/faction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base points/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/painted/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getByText(/enhancements/i)).toBeInTheDocument();
  });

  test('initializes with default values', () => {
    renderAddItemForm();

    // Check default values
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/faction/i)).toHaveValue('Adepta Sororitas'); // First faction
    expect(screen.getByLabelText(/base points/i)).toHaveValue(0);
    expect(screen.getByLabelText(/painted/i)).not.toBeChecked();
    expect(screen.getByLabelText(/notes/i)).toHaveValue('');
  });

  test('allows user to fill in all fields', () => {
    renderAddItemForm();

    const nameInput = screen.getByLabelText(/name/i);
    const factionSelect = screen.getByLabelText(/faction/i);
    const pointsInput = screen.getByLabelText(/base points/i);
    const paintedCheckbox = screen.getByLabelText(/painted/i);
    const notesTextarea = screen.getByLabelText(/notes/i);

    fireEvent.change(nameInput, { target: { value: 'Space Marine Captain' } });
    fireEvent.change(factionSelect, { target: { value: 'Space Marines' } });
    fireEvent.change(pointsInput, { target: { value: '125' } });
    fireEvent.click(paintedCheckbox);
    fireEvent.change(notesTextarea, { target: { value: 'Custom painted gold armor' } });

    expect(nameInput).toHaveValue('Space Marine Captain');
    expect(factionSelect).toHaveValue('Space Marines');
    expect(pointsInput).toHaveValue(125);
    expect(paintedCheckbox).toBeChecked();
    expect(notesTextarea).toHaveValue('Custom painted gold armor');
  });

  test('can add enhancements', () => {
    renderAddItemForm();

    const enhNameInput = screen.getByPlaceholderText('Enhancement Name');
    const enhPointsInput = screen.getByPlaceholderText('Points');

    // Add first enhancement
    fireEvent.change(enhNameInput, { target: { value: 'Power Sword' } });
    fireEvent.change(enhPointsInput, { target: { value: '15' } });
    const addButtons = screen.getAllByRole('button', { name: /^add$/i }); 
    // exact match "Add"
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Power Sword (15 pts)')).toBeInTheDocument();

    // Input fields should be cleared
    expect(enhNameInput).toHaveValue('');
    expect(enhPointsInput).toHaveValue(0);

    // Add second enhancement
    fireEvent.change(enhNameInput, { target: { value: 'Storm Shield' } });
    fireEvent.change(enhPointsInput, { target: { value: '10' } });
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Storm Shield (10 pts)')).toBeInTheDocument();
  });

  test('can remove enhancements', () => {
    renderAddItemForm();

    // Add enhancement
    const enhNameInput = screen.getByPlaceholderText('Enhancement Name');
    const enhPointsInput = screen.getByPlaceholderText('Points');

    fireEvent.change(enhNameInput, { target: { value: 'Power Sword' } });
    fireEvent.change(enhPointsInput, { target: { value: '15' } });
    const addButtons = screen.getAllByRole('button', { name: /^add$/i }); 
    // exact match "Add"
    fireEvent.click(addButtons[0]);

    expect(screen.getByText('Power Sword (15 pts)')).toBeInTheDocument();

    // Remove enhancement
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText('Power Sword (15 pts)')).not.toBeInTheDocument();
  });

  test('does not add empty enhancement', () => {
    renderAddItemForm();

    const addButtons = screen.getAllByRole('button', { name: /^add$/i });
    // exact match "Add"
    fireEvent.click(addButtons[0]);

    // Should not add anything
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument();
  });

  test('submits form with all data', async () => {
    renderAddItemForm();

    // Fill form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Terminator Squad' }
    });
    fireEvent.change(screen.getByLabelText(/faction/i), {
      target: { value: 'Dark Angels' }
    });
    fireEvent.change(screen.getByLabelText(/base points/i), {
      target: { value: '200' }
    });
    fireEvent.click(screen.getByLabelText(/painted/i));
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: 'Deathwing Company' }
    });

    // Add enhancement
    fireEvent.change(screen.getByPlaceholderText('Enhancement Name'), {
      target: { value: 'Thunder Hammer' }
    });
    fireEvent.change(screen.getByPlaceholderText('Points'), {
      target: { value: '20' }
    });
    const addButtons = screen.getAllByRole('button', { name: /^add$/i });
    // exact match "Add"
    fireEvent.click(addButtons[0]);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add item/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSetCollection).toHaveBeenCalledWith(expect.any(Function));
    });

    // Get the function passed to setCollection and call it
    const updateFunction = mockSetCollection.mock.calls[0][0];
    const newCollection = updateFunction([]);

    expect(newCollection).toHaveLength(1);
    expect(newCollection[0]).toMatchObject({
      name: 'Terminator Squad',
      faction: 'Dark Angels',
      basePoints: 200,
      painted: true,
      notes: 'Deathwing Company',
      enhancements: [{ name: 'Thunder Hammer', points: 20 }]
    });
    expect(newCollection[0]).toHaveProperty('id');

    // Should navigate back to home
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  test('handles numeric input correctly', () => {
    renderAddItemForm();

    const pointsInput = screen.getByLabelText(/base points/i);

    // Test with valid number
    fireEvent.change(pointsInput, { target: { value: '150' } });
    expect(pointsInput).toHaveValue(150);

    // Test with invalid input (should default to 0)
    fireEvent.change(pointsInput, { target: { value: 'abc' } });
    expect(pointsInput).toHaveValue(0);
  });

  test('cancel button navigates back', () => {
    renderAddItemForm();

    const cancelButton = screen.getByRole('link', { name: /cancel/i });
    expect(cancelButton).toHaveAttribute('href', '/');
  });

  test('displays all faction options', () => {
    renderAddItemForm();

    const factionSelect = screen.getByLabelText(/faction/i);
    const options = factionSelect.querySelectorAll('option');

    // Should have all factions
    expect(options.length).toBeGreaterThan(30);

    // Check for some specific factions
    const factionTexts = Array.from(options).map(opt => opt.textContent);
    expect(factionTexts).toContain('Space Marines');
    expect(factionTexts).toContain('Necrons');
    expect(factionTexts).toContain('Orks');
    expect(factionTexts).toContain("T'au Empire");
    expect(factionTexts).toContain('Chaos Space Marines');
  });

  test('form requires necessary fields', () => {
    renderAddItemForm();

    const nameInput = screen.getByLabelText(/name/i);
    const pointsInput = screen.getByLabelText(/base points/i);
    const notesTextarea = screen.getByLabelText(/notes/i);

    expect(nameInput).toBeRequired();
    expect(pointsInput).toBeRequired();
    expect(notesTextarea).toBeRequired();
  });
});
