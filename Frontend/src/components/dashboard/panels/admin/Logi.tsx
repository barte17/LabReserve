import React, { useState, useEffect } from 'react';
import { auditLogService } from '../../../../services/auditLogService';
import type { AuditLog, AuditLogFilters } from '../../../../services/auditLogService';
import { useToastContext } from '../../../ToastProvider';

export default function Logi() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showError } = useToastContext();

  // Filtry
  const [filters, setFilters] = useState<AuditLogFilters>({
    sortBy: 'Timestamp',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20
  });

  useEffect(() => {
    loadLogs();
    
    // Cleanup timeout on unmount
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, []);

  // Reaguj na wszystkie zmiany filtrów
  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogService.getAuditLogs(filters);
      setLogs(response.logs);
      setTotalCount(response.totalCount);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
    } catch (error) {
      showError('Błąd podczas ładowania logów');
      console.error('Błąd ładowania logów:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    // Czyść filtr jeśli wartość jest pusta
    const cleanValue = value && value !== '' ? value : undefined;
    
    const newFilters = {
      ...filters,
      [key]: cleanValue,
      page: key !== 'page' ? 1 : value // Reset strony przy zmianie filtrów
    };
    
    // Usuń undefined properties
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k as keyof AuditLogFilters] === undefined) {
        delete newFilters[k as keyof AuditLogFilters];
      }
    });
    
    setFilters(newFilters);
  };


  const handleSort = (column: string) => {
    const newSortOrder = filters.sortBy === column && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    handleFilterChange('sortBy', column);
    handleFilterChange('sortOrder', newSortOrder);
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) return '↕️';
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL');
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'UTWORZENIE_REZERWACJI': return 'bg-green-100 text-green-800';
      case 'ZMIANA_STATUSU_REZERWACJI': return 'bg-blue-100 text-blue-800';
      case 'USUNIECIE_REZERWACJI': return 'bg-red-100 text-red-800';
      case 'LOGOWANIE_UDANE': return 'bg-green-100 text-green-800';
      case 'LOGOWANIE_NIEUDANE': return 'bg-yellow-100 text-yellow-800';
      case 'WYLOGOWANIE': return 'bg-gray-100 text-gray-800';
      case 'REJESTRACJA_UZYTKOWNIKA': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    const clearedFilters: AuditLogFilters = {
      sortBy: 'Timestamp',
      sortOrder: 'desc',
      page: 1,
      pageSize: 20
    };
    setFilters(clearedFilters);
    
    // Natychmiastowe wywołanie API po wyczyszczeniu
    loadLogs();
  };

  return (
    <div className="space-y-6">

      {/* Filtry */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtry i Wyszukiwanie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Akcja</label>
            <input
              type="text"
              value={filters.action || ''}
              onChange={(e) => handleSearchFilterChange('action', e.target.value)}
              placeholder="np. logowanie"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typ Encji</label>
            <select
              value={filters.entityType || ''}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Wszystkie</option>
              <option value="Rezerwacja">Rezerwacja</option>
              <option value="User">User</option>
              <option value="Sala">Sala</option>
              <option value="Stanowisko">Stanowisko</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Użytkownika</label>
            <input
              type="text"
              value={filters.userEmail || ''}
              onChange={(e) => handleSearchFilterChange('userEmail', e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Od</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Do</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Wyczyść
            </button>
          </div>
        </div>
      </div>

      {/* Tabela logów */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Logi ({totalCount} rekordów)
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Strona {currentPage} z {totalPages}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('Timestamp')}
                  >
                    Data {getSortIcon('Timestamp')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('Action')}
                  >
                    Akcja {getSortIcon('Action')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('UserEmail')}
                  >
                    Użytkownik {getSortIcon('UserEmail')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('EntityType')}
                  >
                    Typ {getSortIcon('EntityType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Szczegóły
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono text-xs">
                      {log.userId ? (
                        <span 
                          title={log.userId}
                          className="cursor-help"
                        >
                          {log.userId.length > 12 ? log.userId.substring(0, 12) + '...' : log.userId}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entityId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginacja */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Poprzednia
                </button>
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Następna
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Pokazuję <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> do{' '}
                    <span className="font-medium">{Math.min(currentPage * 20, totalCount)}</span> z{' '}
                    <span className="font-medium">{totalCount}</span> wyników
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleFilterChange('page', pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? 'z-10 bg-red-50 border-red-500 text-red-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}