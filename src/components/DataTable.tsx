import React, { useMemo } from 'react';
import { DataTableProps } from '../types';

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  currentPage,
  itemsPerPage,
  onPageChange
}) => {
  // Calculate pagination
  const paginationInfo = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentData = data.slice(startIndex, endIndex);

    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentData,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [data, currentPage, itemsPerPage]);

  // Display only first 20 items at a time for smooth scrolling
  const visibleItemsPerScroll = 20;
  const visibleData = paginationInfo.currentData.slice(0, visibleItemsPerScroll);

  // Handle page navigation
  const handlePrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (paginationInfo.hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { totalPages } = paginationInfo;
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (data.length === 0) {
    return (
      <div className="data-table">
        <div className="data-table__empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table">
      <div className="data-table__header">
        <div className="data-table__info">
          <span className="data-table__count">
            Showing {paginationInfo.startIndex + 1} - {Math.min(paginationInfo.startIndex + visibleItemsPerScroll, paginationInfo.endIndex)} of {paginationInfo.totalItems} entries
          </span>
        </div>
      </div>

      <div className="data-table__container">
        <table className="data-table__table">
          <thead className="data-table__thead">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="data-table__th">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="data-table__tbody">
            {visibleData.map((row, index) => (
              <tr key={paginationInfo.startIndex + index} className="data-table__tr">
                {columns.map((column) => (
                  <td key={column.key} className="data-table__td">
                    {String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginationInfo.totalPages > 1 && (
        <div className="data-table__pagination">
          <button
            onClick={handlePrevPage}
            disabled={!paginationInfo.hasPrevPage}
            className="data-table__pagination-btn data-table__pagination-btn--prev"
          >
            Previous
          </button>

          <div className="data-table__pagination-numbers">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {typeof pageNum === 'number' ? (
                  <button
                    onClick={() => handlePageClick(pageNum)}
                    className={`data-table__pagination-btn ${
                      currentPage === pageNum ? 'data-table__pagination-btn--active' : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : (
                  <span className="data-table__pagination-ellipsis">
                    {pageNum}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={!paginationInfo.hasNextPage}
            className="data-table__pagination-btn data-table__pagination-btn--next"
          >
            Next
          </button>
        </div>
      )}

      {paginationInfo.currentData.length > visibleItemsPerScroll && (
        <div className="data-table__scroll-info">
          <p>Showing first {visibleItemsPerScroll} entries of {paginationInfo.currentData.length} on this page</p>
          <button 
            className="data-table__show-more"
            onClick={() => {
              // This could be extended to show more items
              console.log('Show more functionality can be implemented here');
            }}
          >
            Scroll to see more
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
