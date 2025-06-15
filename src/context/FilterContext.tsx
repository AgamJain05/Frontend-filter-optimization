import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  DataRow,
  FilterState,
  FilterOption,
  ColumnConfig,
  FilterContextType
} from '../types';
import {
  applyFilters,
  generateAllFilterOptions,
  generateColumnConfigs,
  debounce
} from '../utils/dataUtils';

// Action types
type FilterAction =
  | { type: 'SET_RAW_DATA'; payload: DataRow[] }
  | { type: 'UPDATE_FILTER'; payload: { columnKey: string; selectedValues: (string | number)[] } }
  | { type: 'CLEAR_ALL_FILTERS' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial state
interface FilterStateType {
  rawData: DataRow[];
  filteredData: DataRow[];
  columns: ColumnConfig[];
  filterState: FilterState;
  filterOptions: { [columnKey: string]: FilterOption[] };
  isLoading: boolean;
}

const initialState: FilterStateType = {
  rawData: [],
  filteredData: [],
  columns: [],
  filterState: {},
  filterOptions: {},
  isLoading: false
};

// Reducer
const filterReducer = (state: FilterStateType, action: FilterAction): FilterStateType => {
  switch (action.type) {
    case 'SET_RAW_DATA': {
      const rawData = action.payload;
      const columns = generateColumnConfigs(rawData);
      const initialFilterState: FilterState = {};
      
      // Initialize filter state for all columns
      columns.forEach(column => {
        initialFilterState[column.key] = [];
      });

      const filterOptions = generateAllFilterOptions(rawData, columns, initialFilterState);

      return {
        ...state,
        rawData,
        filteredData: rawData,
        columns,
        filterState: initialFilterState,
        filterOptions,
        isLoading: false
      };
    }

    case 'UPDATE_FILTER': {
      const { columnKey, selectedValues } = action.payload;
      const newFilterState = {
        ...state.filterState,
        [columnKey]: selectedValues
      };

      const filteredData = applyFilters(state.rawData, newFilterState);
      const filterOptions = generateAllFilterOptions(state.rawData, state.columns, newFilterState);

      return {
        ...state,
        filterState: newFilterState,
        filteredData,
        filterOptions
      };
    }

    case 'CLEAR_ALL_FILTERS': {
      const clearedFilterState: FilterState = {};
      state.columns.forEach(column => {
        clearedFilterState[column.key] = [];
      });

      const filterOptions = generateAllFilterOptions(state.rawData, state.columns, clearedFilterState);

      return {
        ...state,
        filterState: clearedFilterState,
        filteredData: state.rawData,
        filterOptions
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      };
    }

    default:
      return state;
  }
};

// Context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider component
export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  // Debounced filter update for performance
  const debouncedUpdateFilter = useMemo(
    () => debounce((columnKey: string, selectedValues: (string | number)[]) => {
      dispatch({ type: 'UPDATE_FILTER', payload: { columnKey, selectedValues } });
    }, 100),
    []
  );

  const updateFilter = useCallback((columnKey: string, selectedValues: (string | number)[]) => {
    debouncedUpdateFilter(columnKey, selectedValues);
  }, [debouncedUpdateFilter]);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_FILTERS' });
  }, []);

  const setRawData = useCallback((data: DataRow[]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      dispatch({ type: 'SET_RAW_DATA', payload: data });
    }, 0);
  }, []);

  const contextValue: FilterContextType = {
    rawData: state.rawData,
    filteredData: state.filteredData,
    columns: state.columns,
    filterState: state.filterState,
    filterOptions: state.filterOptions,
    updateFilter,
    clearAllFilters,
    setRawData,
    isLoading: state.isLoading
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

// Custom hook
export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
