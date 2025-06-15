import React, { useState, useEffect, useCallback } from 'react';
import { useFilter } from '../context/FilterContext';
import { loadCSVFile, parseCSVData } from '../utils/dataUtils';
import FilterPanel from './FilterPanel';
import DataTable from './DataTable';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const {
    rawData,
    filteredData,
    columns,
    filterState,
    filterOptions,
    updateFilter,
    clearAllFilters,
    setRawData,
    isLoading
  } = useFilter();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDataset, setSelectedDataset] = useState<'small' | 'large'>('small');
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 100;

  // Load dataset
  const loadDataset = useCallback(async (dataset: 'small' | 'large') => {
    setLoadingData(true);
    setError(null);
    
    try {
      const filename = dataset === 'small' ? 'dataset_small.csv' : 'dataset_large.csv';
      const csvContent = await loadCSVFile(filename);
      const parsedData = parseCSVData(csvContent);
      
      if (parsedData.length === 0) {
        throw new Error('No data found in the CSV file');
      }
      
      setRawData(parsedData);
      setCurrentPage(1); // Reset to first page
      
      console.log(`Loaded ${parsedData.length} rows from ${filename}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dataset';
      setError(errorMessage);
      console.error('Error loading dataset:', err);
    } finally {
      setLoadingData(false);
    }
  }, [setRawData]);

  // Load initial dataset
  useEffect(() => {
    loadDataset('small');
  }, [loadDataset]);

  // Handle dataset switch
  const handleDatasetSwitch = useCallback(async (dataset: 'small' | 'large') => {
    if (dataset !== selectedDataset) {
      setSelectedDataset(dataset);
      await loadDataset(dataset);
    }
  }, [selectedDataset, loadDataset]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Performance metrics
  const performanceInfo = {
    totalRows: rawData.length,
    filteredRows: filteredData.length,
    activeFilters: Object.values(filterState).reduce((total, values) => total + values.length, 0),
    filterPercentage: rawData.length > 0 ? ((filteredData.length / rawData.length) * 100).toFixed(1) : '0'
  };

  if (loadingData) {
    return (
      <div className="dashboard">
        <LoadingSpinner size="large" message="Loading dataset..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button 
            onClick={() => loadDataset(selectedDataset)}
            className="dashboard__retry-btn"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">Business Intelligence Dashboard</h1>
        <p className="dashboard__subtitle">Advanced Filter System with Real-time Data Interaction</p>
      </header>

      <div className="dashboard__controls">
        <div className="dashboard__dataset-selector">
          <label className="dashboard__label">Dataset:</label>
          <div className="dashboard__radio-group">
            <label className="dashboard__radio">
              <input
                type="radio"
                name="dataset"
                value="small"
                checked={selectedDataset === 'small'}
                onChange={() => handleDatasetSwitch('small')}
              />
              Small Dataset (~10K rows)
            </label>
            <label className="dashboard__radio">
              <input
                type="radio"
                name="dataset"
                value="large"
                checked={selectedDataset === 'large'}
                onChange={() => handleDatasetSwitch('large')}
              />
              Large Dataset (~50K rows)
            </label>
          </div>
        </div>

        <div className="dashboard__performance">
          <div className="dashboard__metric">
            <span className="dashboard__metric-label">Total Rows:</span>
            <span className="dashboard__metric-value">{performanceInfo.totalRows.toLocaleString()}</span>
          </div>
          <div className="dashboard__metric">
            <span className="dashboard__metric-label">Filtered Rows:</span>
            <span className="dashboard__metric-value">{performanceInfo.filteredRows.toLocaleString()}</span>
          </div>
          <div className="dashboard__metric">
            <span className="dashboard__metric-label">Active Filters:</span>
            <span className="dashboard__metric-value">{performanceInfo.activeFilters}</span>
          </div>
          <div className="dashboard__metric">
            <span className="dashboard__metric-label">Data Shown:</span>
            <span className="dashboard__metric-value">{performanceInfo.filterPercentage}%</span>
          </div>
        </div>

        <button 
          onClick={clearAllFilters}
          className="dashboard__clear-btn"
          disabled={performanceInfo.activeFilters === 0}
        >
          Clear All Filters
        </button>
      </div>

      <div className="dashboard__content">
        <aside className="dashboard__sidebar">
          {isLoading ? (
            <LoadingSpinner size="medium" message="Updating filters..." />
          ) : (
            <FilterPanel
              columns={columns}
              filterOptions={filterOptions}
              filterState={filterState}
              onFilterChange={updateFilter}
            />
          )}
        </aside>

        <main className="dashboard__main">
          <DataTable
            data={filteredData}
            columns={columns}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
