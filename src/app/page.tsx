/**
 * Root Page - Redirect to Authentication
 *
 * Redirects users to login page for authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page
    router.push('/landing');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tindago-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading TindaGo...</p>
      </div>
    </div>
  );
}