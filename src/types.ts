// Data types
export interface DataRow {
  [key: string]: string | number;
}

export interface FilterOption {
  value: string | number;
  label: string;
  isSelected: boolean;
}

export interface FilterState {
  [columnName: string]: (string | number)[];
}

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'string' | 'number';
}

// Component Props
export interface DataTableProps {
  data: DataRow[];
  columns: ColumnConfig[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export interface FilterDropdownProps {
  columnKey: string;
  options: FilterOption[];
  selectedValues: (string | number)[];
  onChange: (columnKey: string, selectedValues: (string | number)[]) => void;
  placeholder?: string;
  searchable?: boolean;
}

export interface FilterPanelProps {
  columns: ColumnConfig[];
  filterOptions: { [columnKey: string]: FilterOption[] };
  filterState: FilterState;
  onFilterChange: (columnKey: string, selectedValues: (string | number)[]) => void;
}

// Context types
export interface FilterContextType {
  rawData: DataRow[];
  filteredData: DataRow[];
  columns: ColumnConfig[];
  filterState: FilterState;
  filterOptions: { [columnKey: string]: FilterOption[] };
  updateFilter: (columnKey: string, selectedValues: (string | number)[]) => void;
  clearAllFilters: () => void;
  setRawData: (data: DataRow[]) => void;
  isLoading: boolean;
}

// Pagination types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

// Performance monitoring
export interface PerformanceMetrics {
  filterUpdateTime: number;
  dataProcessingTime: number;
  renderTime: number;
}
