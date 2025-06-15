import React, { useState, useMemo, useCallback } from 'react';
import { FilterDropdownProps } from '../types';

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  columnKey,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select values...',
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  // Handle option toggle
  const handleOptionToggle = useCallback((value: string | number) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onChange(columnKey, newSelection);
  }, [selectedValues, onChange, columnKey]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    const allValues = filteredOptions.map(option => option.value);
    onChange(columnKey, allValues);
  }, [filteredOptions, onChange, columnKey]);

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onChange(columnKey, []);
  }, [onChange, columnKey]);

  const selectedCount = selectedValues.length;
  const totalCount = options.length;

  return (
    <div className="filter-dropdown">
      <div className="filter-dropdown__header">
        <label className="filter-dropdown__label">
          {columnKey.charAt(0).toUpperCase() + columnKey.slice(1)}
        </label>
        <button
          className="filter-dropdown__trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span className="filter-dropdown__text">
            {selectedCount === 0 
              ? placeholder 
              : `${selectedCount} of ${totalCount} selected`
            }
          </span>
          <span className={`filter-dropdown__arrow ${isOpen ? 'open' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="filter-dropdown__content">
          {searchable && (
            <div className="filter-dropdown__search">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-dropdown__search-input"
              />
            </div>
          )}

          <div className="filter-dropdown__actions">
            <button
              onClick={handleSelectAll}
              className="filter-dropdown__action-btn"
              disabled={filteredOptions.length === 0}
            >
              Select All ({filteredOptions.length})
            </button>
            <button
              onClick={handleClearAll}
              className="filter-dropdown__action-btn"
              disabled={selectedCount === 0}
            >
              Clear All
            </button>
          </div>

          <div className="filter-dropdown__options">
            {filteredOptions.length === 0 ? (
              <div className="filter-dropdown__no-options">
                No options available
              </div>
            ) : (
              filteredOptions.map((option) => (
                <label
                  key={`${option.value}`}
                  className="filter-dropdown__option"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleOptionToggle(option.value)}
                    className="filter-dropdown__checkbox"
                  />
                  <span className="filter-dropdown__option-text">
                    {option.label}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
