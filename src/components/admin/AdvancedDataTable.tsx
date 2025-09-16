/**
 * Advanced Data Table Component
 *
 * Enhanced data table with search, pagination, filtering, and sorting for TindaGo Admin
 */

'use client';

import React, { useState, useMemo } from 'react';
import { StoreRegistration } from '@/lib/adminService';
import { Button } from '@/components/ui/Button';

interface AdvancedDataTableProps {
  registrations: StoreRegistration[];
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason?: string) => void;
  processingIds: Set<string>;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';
type SortField = 'storeName' | 'ownerName' | 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

export const AdvancedDataTable: React.FC<AdvancedDataTableProps> = ({
  registrations,
  onApprove,
  onReject,
  processingIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filter and search logic
  const filteredAndSortedData = useMemo(() => {
    let filtered = registrations;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reg => reg.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(reg =>
        reg.storeName.toLowerCase().includes(searchLower) ||
        reg.ownerName.toLowerCase().includes(searchLower) ||
        reg.email.toLowerCase().includes(searchLower) ||
        reg.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [registrations, filterStatus, searchTerm, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-tindago-100 text-tindago-800 border-tindago-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges] || badges.pending}`;
  };

  const handleRejectWithReason = (userId: string) => {
    onReject(userId, rejectReason);
    setShowRejectModal(null);
    setRejectReason('');
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-tindago-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-tindago-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-soft border border-secondary-200">
      {/* Table Header with Controls */}
      <div className="px-6 py-4 border-b border-secondary-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Store Registrations</h2>
            <p className="mt-1 text-sm text-secondary-600">
              {filteredAndSortedData.length} of {registrations.length} registrations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg bg-white text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="flex space-x-2">
              {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filterStatus === status
                      ? 'bg-tindago-100 text-tindago-700 border border-tindago-200'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 border border-secondary-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        {currentData.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No registrations found</h3>
            <p className="mt-1 text-sm text-secondary-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No store registrations have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th
                    onClick={() => handleSort('storeName')}
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Store Details</span>
                      {getSortIcon('storeName')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('ownerName')}
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Owner Information</span>
                      {getSortIcon('ownerName')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Submitted</span>
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {currentData.map((registration) => (
                  <tr key={registration.userId} className="hover:bg-secondary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">
                          {registration.storeName}
                        </div>
                        <div className="text-sm text-secondary-500 truncate max-w-xs">
                          {registration.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">
                          {registration.ownerName}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {registration.email}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {registration.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(registration.status)}>
                        {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                      {formatDate(registration.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {registration.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onApprove(registration.userId)}
                            disabled={processingIds.has(registration.userId)}
                          >
                            {processingIds.has(registration.userId) ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowRejectModal(registration.userId)}
                            disabled={processingIds.has(registration.userId)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {processingIds.has(registration.userId) ? 'Processing...' : 'Reject'}
                          </Button>
                        </div>
                      )}
                      {registration.status !== 'pending' && (
                        <span className="text-secondary-400">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAndSortedData.length > 0 && (
        <div className="bg-white px-6 py-4 border-t border-secondary-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <label className="text-sm text-secondary-700">Show:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-secondary-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tindago-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-secondary-700">
                entries per page
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
              </span>

              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-secondary-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-100 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2 py-1 text-secondary-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-tindago-500 text-white border-tindago-500'
                            : 'border-secondary-300 hover:bg-secondary-100'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-secondary-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity" onClick={() => setShowRejectModal(null)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-secondary-900">
                      Reject Store Registration
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-secondary-500">
                        Please provide a reason for rejecting this store registration. This will help the applicant understand the decision.
                      </p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows={3}
                        className="mt-3 block w-full border border-secondary-300 rounded-md px-3 py-2 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="secondary"
                  onClick={() => handleRejectWithReason(showRejectModal)}
                  className="w-full justify-center text-red-600 border-red-300 hover:bg-red-50 sm:ml-3 sm:w-auto"
                >
                  Reject Registration
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason('');
                  }}
                  className="mt-3 w-full justify-center sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};