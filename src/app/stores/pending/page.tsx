'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService, StoreRegistration } from '@/lib/adminService';

export default function PendingApprovalsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<StoreRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const pendingRegistrations = await AdminService.getPendingStoreRegistrations();
        setRegistrations(pendingRegistrations);
      } catch (error) {
        console.error('Error fetching pending registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const handleRowClick = (userId: string) => {
    router.push(`/stores/pending/${userId}`);
  };

  if (loading) {
    return (
      <div
        className="relative"
        style={{
          width: '100%',
          maxWidth: '1440px',
          minHeight: '1024px',
          backgroundColor: '#F3F5F9',
          margin: '0 auto',
          padding: '40px'
        }}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-lg font-medium text-gray-600">Loading pending approvals...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        width: '100%',
        maxWidth: '1440px',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        margin: '0 auto',
        padding: '40px'
      }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 600,
            fontSize: '32px',
            color: '#1E1E1E',
            marginBottom: '8px'
          }}
        >
          Pending Approvals
        </h1>
        <p
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '16px',
            color: 'rgba(30, 30, 30, 0.6)'
          }}
        >
          Review and approve store registration applications
        </p>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div style={{ padding: '24px' }}>
          <h2
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 600,
              fontSize: '20px',
              color: '#1E1E1E',
              marginBottom: '16px'
            }}
          >
            Store Registration Applications ({registrations.length})
          </h2>

          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <p
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '16px',
                  color: 'rgba(30, 30, 30, 0.6)'
                }}
              >
                No pending registrations found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <th
                      className="text-left py-4 px-2"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'rgba(30, 30, 30, 0.6)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Store Name
                    </th>
                    <th
                      className="text-left py-4 px-2"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'rgba(30, 30, 30, 0.6)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Owner
                    </th>
                    <th
                      className="text-left py-4 px-2"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'rgba(30, 30, 30, 0.6)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Email
                    </th>
                    <th
                      className="text-left py-4 px-2"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'rgba(30, 30, 30, 0.6)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Submitted
                    </th>
                    <th
                      className="text-left py-4 px-2"
                      style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '12px',
                        color: 'rgba(30, 30, 30, 0.6)',
                        textTransform: 'uppercase'
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr
                      key={registration.userId}
                      onClick={() => handleRowClick(registration.userId)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: '1px solid #F3F4F6' }}
                    >
                      <td className="py-4 px-2">
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#1E1E1E'
                          }}
                        >
                          {registration.businessInfo?.storeName || registration.storeName || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-2">
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#1E1E1E'
                          }}
                        >
                          {registration.personalInfo?.name || registration.name || registration.ownerName || registration.displayName || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-2">
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: 'rgba(30, 30, 30, 0.7)'
                          }}
                        >
                          {registration.personalInfo?.email || registration.email || registration.ownerEmail || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-2">
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: 'rgba(30, 30, 30, 0.7)'
                          }}
                        >
                          {registration.createdAt
                            ? new Date(registration.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-2">
                        <div
                          className="inline-flex items-center px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: '#FEF3C7',
                            border: '1px solid #F59E0B'
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: '#D97706' }}
                          />
                          <span
                            style={{
                              fontFamily: 'Inter',
                              fontWeight: 500,
                              fontSize: '11px',
                              color: '#D97706'
                            }}
                          >
                            Pending
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p
          style={{
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '14px',
            color: '#1E40AF'
          }}
        >
          💡 <strong>Tip:</strong> Click on any row to view detailed store registration information and take approval actions.
        </p>
      </div>
    </div>
  );
}