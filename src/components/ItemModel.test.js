// src/models/__tests__/ItemModel.test.js
import '@testing-library/jest-dom';

// Test utilities for item validation and manipulation
export const ItemUtils = {
  validateItem: (item) => {
    const errors = [];
    
    if (!item.name || item.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!item.faction) {
      errors.push('Faction is required');
    }
    
    if (typeof item.basePoints !== 'number' || item.basePoints < 0) {
      errors.push('Base points must be a positive number');
    }
    
    if (typeof item.painted !== 'boolean') {
      errors.push('Painted must be a boolean');
    }
    
    if (item.enhancements && !Array.isArray(item.enhancements)) {
      errors.push('Enhancements must be an array');
    }
    
    if (item.enhancements) {
      item.enhancements.forEach((enh, index) => {
        if (!enh.name) {
          errors.push(`Enhancement ${index + 1}: name is required`);
        }
        if (typeof enh.points !== 'number' || enh.points < 0) {
          errors.push(`Enhancement ${index + 1}: points must be a positive number`);
        }
      });
    }
    
    return errors;
  },
  
  calculateTotalPoints: (item, modelCount = 1, selectedEnhancements = []) => {
    const baseTotal = item.basePoints * modelCount;
    const enhancementTotal = item.enhancements
      .filter(enh => selectedEnhancements.includes(enh.name))
      .reduce((sum, enh) => sum + enh.points, 0);
    return baseTotal + enhancementTotal;
  },
  
  createItem: (data) => {
    return {
      id: Date.now(),
      name: data.name || '',
      faction: data.faction || '',
      basePoints: parseInt(data.basePoints) || 0,
      painted: Boolean(data.painted),
      notes: data.notes || '',
      enhancements: data.enhancements || []
    };
  },
  
  createArmyUnit: (item) => {
    return {
      ...item,
      modelCount: 1,
      selectedEnhancements: []
    };
  },
  
  formatArmyListEntry: (unit) => {
    const selectedEnh = unit.selectedEnhancements.join(', ') || 'None';
    const points = ItemUtils.calculateTotalPoints(unit, unit.modelCount, unit.selectedEnhancements);
    return `${unit.name} (${unit.faction}) - Models: ${unit.modelCount}, Enhancements: ${selectedEnh}, Points: ${points}`;
  }
};

describe('ItemModel', () => {
  describe('Item Validation', () => {
    test('validates correct item', () => {
      const validItem = {
        name: 'Space Marine Captain',
        faction: 'Space Marines',
        basePoints: 100,
        painted: true,
        notes: 'HQ choice',
        enhancements: [
          { name: 'Power Sword', points: 10 }
        ]
      };
      
      const errors = ItemUtils.validateItem(validItem);
      expect(errors).toHaveLength(0);
    });

    test('validates item without enhancements', () => {
      const validItem = {
        name: 'Tactical Squad',
        faction: 'Space Marines',
        basePoints: 90,
        painted: false,
        notes: 'Troops',
        enhancements: []
      };
      
      const errors = ItemUtils.validateItem(validItem);
      expect(errors).toHaveLength(0);
    });

    test('detects missing name', () => {
      const invalidItem = {
        name: '',
        faction: 'Space Marines',
        basePoints: 100,
        painted: true,
        enhancements: []
      };
      
      const errors = ItemUtils.validateItem(invalidItem);
      expect(errors).toContain('Name is required');
    });

    test('detects missing faction', () => {
      const invalidItem = {
        name: 'Test Unit',
        faction: '',
        basePoints: 100,
        painted: true,
        enhancements: []
      };
      
      const errors = ItemUtils.validateItem(invalidItem);
      expect(errors).toContain('Faction is required');
    });

    test('detects invalid base points', () => {
      const invalidItem = {
        name: 'Test Unit',
        faction: 'Space Marines',
        basePoints: -10,
        painted: true,
        enhancements: []
      };
      
      const errors = ItemUtils.validateItem(invalidItem);
      expect(errors).toContain('Base points must be a positive number');
    });

    test('detects non-boolean painted value', () => {
      const invalidItem = {
        name: 'Test Unit',
        faction: 'Space Marines',
        basePoints: 100,
        painted: 'yes',
        enhancements: []
      };
      
      const errors = ItemUtils.validateItem(invalidItem);
      expect(errors).toContain('Painted must be a boolean');
    });

    test('validates enhancement structure', () => {
      const invalidItem = {
        name: 'Test Unit',
        faction: 'Space Marines',
        basePoints: 100,
        painted: true,
        enhancements: [
          { name: '', points: 10 },
          { name: 'Valid Enhancement', points: -5 }
        ]
      };
      
      const errors = ItemUtils.validateItem(invalidItem);
      expect(errors).toContain('Enhancement 1: name is required');
      expect(errors).toContain('Enhancement 2: points must be a positive number');
    });
  });

  describe('Point Calculations', () => {
    const testItem = {
      name: 'Test Unit',
      faction: 'Test Faction',
      basePoints: 100,
      painted: true,
      notes: '',
      enhancements: [
        { name: 'Enhancement 1', points: 10 },
        { name: 'Enhancement 2', points: 15 },
        { name: 'Enhancement 3', points: 20 }
      ]
    };

    test('calculates base points with model count', () => {
      const points = ItemUtils.calculateTotalPoints(testItem, 3, []);
      expect(points).toBe(300); // 100 * 3
    });

    test('calculates points with single enhancement', () => {
      const points = ItemUtils.calculateTotalPoints(testItem, 1, ['Enhancement 1']);
      expect(points).toBe(110); // 100 + 10
    });

    test('calculates points with multiple enhancements', () => {
      const points = ItemUtils.calculateTotalPoints(
        testItem, 
        2, 
        ['Enhancement 1', 'Enhancement 3']
      );
      expect(points).toBe(230); // (100 * 2) + 10 + 20
    });

    test('ignores non-existent enhancements', () => {
      const points = ItemUtils.calculateTotalPoints(
        testItem, 
        1, 
        ['Enhancement 1', 'Non-existent Enhancement']
      );
      expect(points).toBe(110); // 100 + 10 (ignores non-existent)
    });

    test('handles empty enhancement array', () => {
      const itemNoEnh = { ...testItem, enhancements: [] };
      const points = ItemUtils.calculateTotalPoints(itemNoEnh, 5, []);
      expect(points).toBe(500); // 100 * 5
    });
  });

  describe('Item Creation', () => {
    test('creates item with all fields', () => {
      const data = {
        name: 'New Unit',
        faction: 'New Faction',
        basePoints: '150',
        painted: true,
        notes: 'Test notes',
        enhancements: [{ name: 'Test', points: 5 }]
      };
      
      const item = ItemUtils.createItem(data);
      
      expect(item).toHaveProperty('id');
      expect(item.name).toBe('New Unit');
      expect(item.faction).toBe('New Faction');
      expect(item.basePoints).toBe(150);
      expect(item.painted).toBe(true);
      expect(item.notes).toBe('Test notes');
      expect(item.enhancements).toHaveLength(1);
    });

    test('creates item with defaults for missing fields', () => {
      const item = ItemUtils.createItem({});
      
      expect(item).toHaveProperty('id');
      expect(item.name).toBe('');
      expect(item.faction).toBe('');
      expect(item.basePoints).toBe(0);
      expect(item.painted).toBe(false);
      expect(item.notes).toBe('');
      expect(item.enhancements).toEqual([]);
    });

    test('parses string base points to number', () => {
      const item = ItemUtils.createItem({ basePoints: '250' });
      expect(item.basePoints).toBe(250);
      expect(typeof item.basePoints).toBe('number');
    });

    test('handles invalid base points', () => {
      const item = ItemUtils.createItem({ basePoints: 'invalid' });
      expect(item.basePoints).toBe(0);
    });
  });

  describe('Army Unit Creation', () => {
    test('creates army unit from item', () => {
      const item = {
        id: 1,
        name: 'Test Unit',
        faction: 'Test Faction',
        basePoints: 100,
        painted: true,
        notes: 'Notes',
        enhancements: [{ name: 'Enhancement', points: 10 }]
      };
      
      const armyUnit = ItemUtils.createArmyUnit(item);
      
      expect(armyUnit).toMatchObject(item);
      expect(armyUnit.modelCount).toBe(1);
      expect(armyUnit.selectedEnhancements).toEqual([]);
    });

    test('preserves original item properties', () => {
      const item = {
        id: 123,
        name: 'Special Unit',
        faction: 'Special Faction',
        basePoints: 200,
        painted: false,
        notes: 'Special notes',
        enhancements: []
      };
      
      const armyUnit = ItemUtils.createArmyUnit(item);
      
      expect(armyUnit.id).toBe(123);
      expect(armyUnit.name).toBe('Special Unit');
      expect(armyUnit.basePoints).toBe(200);
    });
  });

  describe('Army List Formatting', () => {
    test('formats army unit without enhancements', () => {
      const unit = {
        name: 'Tactical Squad',
        faction: 'Space Marines',
        basePoints: 90,
        modelCount: 10,
        selectedEnhancements: [],
        enhancements: []
      };
      
      const formatted = ItemUtils.formatArmyListEntry(unit);
      expect(formatted).toBe('Tactical Squad (Space Marines) - Models: 10, Enhancements: None, Points: 900');
    });

    test('formats army unit with enhancements', () => {
      const unit = {
        name: 'Captain',
        faction: 'Blood Angels',
        basePoints: 100,
        modelCount: 1,
        selectedEnhancements: ['Power Sword', 'Jump Pack'],
        enhancements: [
          { name: 'Power Sword', points: 10 },
          { name: 'Jump Pack', points: 25 }
        ]
      };
      
      const formatted = ItemUtils.formatArmyListEntry(unit);
      expect(formatted).toBe('Captain (Blood Angels) - Models: 1, Enhancements: Power Sword, Jump Pack, Points: 135');
    });

    test('formats army unit with multiple models and enhancements', () => {
      const unit = {
        name: 'Terminators',
        faction: 'Dark Angels',
        basePoints: 200,
        modelCount: 5,
        selectedEnhancements: ['Thunder Hammers'],
        enhancements: [
          { name: 'Thunder Hammers', points: 40 }
        ]
      };
      
      const formatted = ItemUtils.formatArmyListEntry(unit);
      expect(formatted).toBe('Terminators (Dark Angels) - Models: 5, Enhancements: Thunder Hammers, Points: 1040');
    });
  });
});
