import React from 'react';
import { FilterPanelProps } from '../types';
import FilterDropdown from './FilterDropdown';

const FilterPanel: React.FC<FilterPanelProps> = ({
  columns,
  filterOptions,
  filterState,
  onFilterChange
}) => {
  return (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <h2 className="filter-panel__title">Filters</h2>
        <div className="filter-panel__summary">
          {Object.values(filterState).reduce((total, values) => total + values.length, 0)} filters applied
        </div>
      </div>

      <div className="filter-panel__content">
        {columns.map((column) => (
          <div key={column.key} className="filter-panel__item">
            <FilterDropdown
              columnKey={column.key}
              options={filterOptions[column.key] || []}
              selectedValues={filterState[column.key] || []}
              onChange={onFilterChange}
              placeholder={`Filter by ${column.label}...`}
              searchable={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;
