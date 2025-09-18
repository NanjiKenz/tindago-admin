/**
 * Contact Page
 *
 * Contact form and information for TindaGo support
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate contact form submission
    setTimeout(() => {
      setIsLoading(false);
      alert('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <Link href="/landing">
              <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-tindago-600 to-tindago-500 bg-clip-text text-transparent">
                TindaGo
              </div>
            </Link>
            <Link href="/landing">
              <Button variant="ghost" size="md">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about TindaGo? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-soft p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleChange('name', value)}
                  placeholder="Enter your full name"
                  required
                />

                <FormInput
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleChange('email', value)}
                  placeholder="Enter your email"
                  required
                />

                <FormInput
                  label="Subject"
                  type="text"
                  value={formData.subject}
                  onChange={(value) => handleChange('subject', value)}
                  placeholder="What is this about?"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleTextareaChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  fullWidth
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow-soft p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 text-tindago-600 mt-1">
                      📧
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">support@tindago.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 text-tindago-600 mt-1">
                      📞
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-gray-600">+63 (02) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 text-tindago-600 mt-1">
                      📍
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-gray-600">
                        123 Business District<br />
                        Makati City, Metro Manila<br />
                        Philippines 1200
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-tindago-600 to-tindago-500 rounded-xl shadow-soft p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Need immediate help?</h3>
                <p className="text-tindago-100 mb-4">
                  Our support team is available 24/7 to help you with any questions or issues.
                </p>
                <Link href="/auth/register">
                  <Button
                    variant="secondary"
                    size="md"
                    className="bg-white text-tindago-600 hover:bg-gray-100"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-soft p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-tindago-100 transition-colors">
                    <span className="text-lg">📘</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-tindago-100 transition-colors">
                    <span className="text-lg">🐦</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-tindago-100 transition-colors">
                    <span className="text-lg">📷</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-tindago-100 transition-colors">
                    <span className="text-lg">💼</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}