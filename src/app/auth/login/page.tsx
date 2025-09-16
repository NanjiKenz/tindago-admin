/**
 * Login Page
 *
 * TindaGo Admin login page with modern glassmorphism design
 */

'use client';

import { AuthLayout, LoginForm } from '@/components/auth';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access the TindaGo Admin Dashboard"
    >
      <LoginForm />
    </AuthLayout>
  );
}