import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Layers } from 'lucide-react';
import { Pagination, ConfigProvider, theme } from 'antd';

const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  searchPlaceholder = 'Search records...',
  emptyMessage = 'No records found',
  actions,
  pageSize: initialPageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode from document class
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize, data.length]);

  // Filter data based on search term across all properties
  const filteredData = data.filter((item) =>
    Object.values(item).some(
      (val) =>
        val !== null &&
        val !== undefined &&
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1', // Indigo primary color
          borderRadius: 10,
          fontSize: 12,
        },
      }}
    >
      <div className="space-y-4">
        {/* Search & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="p-4 whitespace-nowrap">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="p-12 text-center text-indigo-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Loading data...</span>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="p-12 text-center text-slate-400 dark:text-slate-500">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-medium text-sm text-slate-600 dark:text-slate-400">{emptyMessage}</p>
                      {searchTerm && (
                        <p className="text-xs text-slate-400 mt-1">No matching results for "{searchTerm}"</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rowIdx) => (
                    <tr
                      key={row.id || rowIdx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      {columns.map((col, colIdx) => (
                        <td key={colIdx} className="p-4 align-middle whitespace-nowrap">
                          {col.render
                            ? col.render(row)
                            : typeof col.accessor === 'function'
                            ? col.accessor(row)
                            : row[col.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Built-in Ant Design Pagination Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              showSizeChanger
              pageSizeOptions={['5', '10', '25', '50', '100']}
              showTotal={(total, range) => (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Showing <strong className="text-slate-900 dark:text-white font-bold">{total > 0 ? range[0] : 0}-{range[1]}</strong> of{' '}
                  <strong className="text-slate-900 dark:text-white font-bold">{total}</strong> entries
                </span>
              )}
              onChange={(page, newPageSize) => {
                setCurrentPage(page);
                setPageSize(newPageSize);
              }}
              className="w-full flex items-center justify-between font-sans text-xs"
            />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default DataTable;
