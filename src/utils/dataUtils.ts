import { DataRow, FilterState, FilterOption, ColumnConfig } from '../types';

/**
 * Parse CSV data from file content
 */
export const parseCSVData = (csvContent: string): DataRow[] => {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: DataRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === headers.length) {
      const row: DataRow = {};
      headers.forEach((header, index) => {
        // Try to parse as number, fallback to string
        const value = values[index];
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      data.push(row);
    }
  }

  return data;
};

/**
 * Generate column configurations from data
 */
export const generateColumnConfigs = (data: DataRow[]): ColumnConfig[] => {
  if (data.length === 0) return [];

  const firstRow = data[0];
  return Object.keys(firstRow).map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    type: typeof firstRow[key] === 'number' ? 'number' : 'string'
  }));
};

/**
 * Apply filters to data with performance optimization
 */
export const applyFilters = (
  data: DataRow[],
  filterState: FilterState
): DataRow[] => {
  const startTime = performance.now();
  // If no filters are applied, return original data
  const activeFilters = Object.entries(filterState).filter(
    ([, values]: [string, (string | number)[]]) => values.length > 0
  );

  if (activeFilters.length === 0) {
    return data;
  }

  // Apply filters efficiently
  const filtered = data.filter(row => {
    return activeFilters.every(([columnKey, selectedValues]: [string, (string | number)[]]) => {
      const cellValue = row[columnKey];
      return selectedValues.includes(cellValue);
    });
  });

  const endTime = performance.now();
  console.log(`Filter applied in ${endTime - startTime}ms`);

  return filtered;
};

/**
 * Generate filter options for a specific column based on cross-filter logic
 */
export const generateFilterOptions = (
  data: DataRow[],
  targetColumn: string,
  filterState: FilterState,
  currentSelection: (string | number)[]
): FilterOption[] => {
  const startTime = performance.now();

  // Create a filter state excluding the target column
  const otherFilters = { ...filterState };
  delete otherFilters[targetColumn];

  // Apply other filters to get relevant data subset
  const relevantData = applyFilters(data, otherFilters);

  // Extract unique values from the target column
  const uniqueValues = Array.from(
    new Set(relevantData.map(row => row[targetColumn]))
  ).sort((a, b) => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });

  // Create filter options with selection state
  const options: FilterOption[] = uniqueValues.map(value => ({
    value,
    label: String(value),
    isSelected: currentSelection.includes(value)
  }));

  const endTime = performance.now();
  console.log(`Filter options generated for ${targetColumn} in ${endTime - startTime}ms`);

  return options;
};

/**
 * Generate all filter options for all columns
 */
export const generateAllFilterOptions = (
  data: DataRow[],
  columns: ColumnConfig[],
  filterState: FilterState
): { [columnKey: string]: FilterOption[] } => {
  const allOptions: { [columnKey: string]: FilterOption[] } = {};

  columns.forEach(column => {
    const currentSelection = filterState[column.key] || [];
    allOptions[column.key] = generateFilterOptions(
      data,
      column.key,
      filterState,
      currentSelection
    );
  });

  return allOptions;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
};

/**
 * Get paginated data
 */
export const getPaginatedData = (
  data: DataRow[],
  currentPage: number,
  itemsPerPage: number
): DataRow[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};

/**
 * Calculate pagination info
 */
export const calculatePagination = (
  totalItems: number,
  itemsPerPage: number,
  currentPage: number
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * Load CSV file from public folder
 */
export const loadCSVFile = async (filename: string): Promise<string> => {
  try {
    const response = await fetch(`/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading CSV file ${filename}:`, error);
    throw error;
  }
};
