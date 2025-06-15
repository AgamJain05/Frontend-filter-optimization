import { parseCSVData, generateColumnConfigs, applyFilters, generateFilterOptions } from '../utils/dataUtils';
import { DataRow, FilterState } from '../types';

describe('dataUtils', () => {
  const mockCSVData = `number,mod3,mod4,mod5
12,0,0,2
24,0,0,4
36,0,0,1`;

  const mockDataRows: DataRow[] = [
    { number: 12, mod3: 0, mod4: 0, mod5: 2 },
    { number: 24, mod3: 0, mod4: 0, mod5: 4 },
    { number: 36, mod3: 0, mod4: 0, mod5: 1 }
  ];

  describe('parseCSVData', () => {
    it('should parse CSV data correctly', () => {
      const result = parseCSVData(mockCSVData);
      expect(result).toEqual(mockDataRows);
    });

    it('should handle empty CSV data', () => {
      const result = parseCSVData('');
      expect(result).toEqual([]);
    });

    it('should handle CSV with only headers', () => {
      const result = parseCSVData('number,mod3,mod4,mod5');
      expect(result).toEqual([]);
    });
  });

  describe('generateColumnConfigs', () => {
    it('should generate column configurations from data', () => {
      const result = generateColumnConfigs(mockDataRows);
      expect(result).toEqual([
        { key: 'number', label: 'Number', type: 'number' },
        { key: 'mod3', label: 'Mod3', type: 'number' },
        { key: 'mod4', label: 'Mod4', type: 'number' },
        { key: 'mod5', label: 'Mod5', type: 'number' }
      ]);
    });

    it('should handle empty data', () => {
      const result = generateColumnConfigs([]);
      expect(result).toEqual([]);
    });
  });

  describe('applyFilters', () => {
    it('should return all data when no filters are applied', () => {
      const filterState: FilterState = {
        number: [],
        mod3: [],
        mod4: [],
        mod5: []
      };
      const result = applyFilters(mockDataRows, filterState);
      expect(result).toEqual(mockDataRows);
    });

    it('should filter data correctly with single filter', () => {
      const filterState: FilterState = {
        number: [12],
        mod3: [],
        mod4: [],
        mod5: []
      };
      const result = applyFilters(mockDataRows, filterState);
      expect(result).toEqual([mockDataRows[0]]);
    });

    it('should filter data correctly with multiple filters', () => {
      const filterState: FilterState = {
        number: [],
        mod3: [0],
        mod4: [],
        mod5: [2, 4]
      };
      const result = applyFilters(mockDataRows, filterState);
      expect(result).toEqual([mockDataRows[0], mockDataRows[1]]);
    });

    it('should return empty array when no data matches filters', () => {
      const filterState: FilterState = {
        number: [999],
        mod3: [],
        mod4: [],
        mod5: []
      };
      const result = applyFilters(mockDataRows, filterState);
      expect(result).toEqual([]);
    });
  });

  describe('generateFilterOptions', () => {
    it('should generate filter options for a column', () => {
      const filterState: FilterState = {
        number: [],
        mod3: [],
        mod4: [],
        mod5: []
      };
      const result = generateFilterOptions(mockDataRows, 'mod5', filterState, []);
      
      expect(result).toEqual([
        { value: 1, label: '1', isSelected: false },
        { value: 2, label: '2', isSelected: false },
        { value: 4, label: '4', isSelected: false }
      ]);
    });

    it('should reflect current selection in options', () => {
      const filterState: FilterState = {
        number: [],
        mod3: [],
        mod4: [],
        mod5: []
      };
      const result = generateFilterOptions(mockDataRows, 'mod5', filterState, [2, 4]);
      
      expect(result).toEqual([
        { value: 1, label: '1', isSelected: false },
        { value: 2, label: '2', isSelected: true },
        { value: 4, label: '4', isSelected: true }
      ]);
    });

    it('should filter options based on other applied filters', () => {
      const filterState: FilterState = {
        number: [12],
        mod3: [],
        mod4: [],
        mod5: []
      };
      const result = generateFilterOptions(mockDataRows, 'mod5', filterState, []);
      
      expect(result).toEqual([
        { value: 2, label: '2', isSelected: false }
      ]);
    });
  });
});
