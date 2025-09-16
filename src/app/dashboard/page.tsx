/**
 * Clean Professional Dashboard Page
 *
 * Modern admin dashboard with organized layout and clean design
 */

'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { DataTable } from '@/components/dashboard/DataTable';

const DashboardPage: React.FC = () => {
  // Sample data for demonstration
  const storeRegistrations = [
    {
      id: 'SR001',
      storeName: 'Maria\'s Sari-Sari Store',
      ownerName: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '+63 912 345 6789',
      address: 'Barangay San Jose, Quezon City',
      status: 'pending',
      submittedDate: '2024-01-15',
      documents: 'Complete'
    },
    {
      id: 'SR002',
      storeName: 'Lucky Convenience Store',
      ownerName: 'Juan Dela Cruz',
      email: 'juan.delacruz@email.com',
      phone: '+63 917 888 9999',
      address: 'Barangay Poblacion, Manila',
      status: 'approved',
      submittedDate: '2024-01-14',
      documents: 'Complete'
    },
    {
      id: 'SR003',
      storeName: 'Rosie\'s Mini Mart',
      ownerName: 'Rosario Reyes',
      email: 'rosie.reyes@email.com',
      phone: '+63 920 111 2222',
      address: 'Barangay Marikina Heights, Marikina',
      status: 'rejected',
      submittedDate: '2024-01-13',
      documents: 'Incomplete'
    },
    {
      id: 'SR004',
      storeName: 'Tito Boy\'s Corner Store',
      ownerName: 'Roberto Gonzales',
      email: 'tito.boy@email.com',
      phone: '+63 918 555 7777',
      address: 'Barangay Cubao, Quezon City',
      status: 'approved',
      submittedDate: '2024-01-12',
      documents: 'Complete'
    },
    {
      id: 'SR005',
      storeName: 'Aling Nena\'s Store',
      ownerName: 'Magdalena Cruz',
      email: 'nena.cruz@email.com',
      phone: '+63 915 333 4444',
      address: 'Barangay Pasig, Pasig City',
      status: 'pending',
      submittedDate: '2024-01-11',
      documents: 'Under Review'
    },
    {
      id: 'SR006',
      storeName: 'Quick Stop Convenience',
      ownerName: 'Michael Tan',
      email: 'michael.tan@email.com',
      phone: '+63 922 666 8888',
      address: 'Barangay Makati, Makati City',
      status: 'approved',
      submittedDate: '2024-01-10',
      documents: 'Complete'
    }
  ];

  const columns = [
    { key: 'id', label: 'ID', sortable: true, width: '100px' },
    { key: 'storeName', label: 'Store Name', sortable: true },
    { key: 'ownerName', label: 'Owner', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true, width: '120px' },
    { key: 'submittedDate', label: 'Date', sortable: true, width: '120px' }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your TindaGo marketplace operations</p>
        </div>

        {/* Statistics Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New store registration from Maria Santos</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Store approved: Lucky Convenience Store</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Document verification pending for 5 stores</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Monthly report generated successfully</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full text-left p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    Review Pending
                  </button>
                  <button className="w-full text-left p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    Generate Report
                  </button>
                  <button className="w-full text-left p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    View Analytics
                  </button>
                  <button className="w-full text-left p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    Manage Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Today's Summary</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Registrations</span>
                    <span className="text-sm font-semibold text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved Today</span>
                    <span className="text-sm font-semibold text-gray-900">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Reviews</span>
                    <span className="text-sm font-semibold text-gray-900">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue Today</span>
                    <span className="text-sm font-semibold text-gray-900">₱18,420</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Registrations Table */}
        <DataTable
          title="Recent Store Registrations"
          columns={columns}
          data={storeRegistrations}
          searchable={true}
          filterable={true}
          exportable={true}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;