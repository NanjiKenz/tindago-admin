/**
 * FormInput Component
 *
 * Simple form input using Tailwind CSS
 */

'use client';

import React from 'react';

interface FormInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel';
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  error
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-secondary-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={`
            block w-full px-4 py-3 text-base rounded-xl transition-all duration-200
            placeholder-secondary-400
            focus:outline-none focus:ring-2 focus:ring-tindago-500/20 focus:border-tindago-500
            disabled:bg-secondary-50 disabled:text-secondary-500 disabled:cursor-not-allowed
            ${error
              ? 'border-2 border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50/50'
              : 'border border-secondary-200 bg-white/50 hover:bg-white focus:bg-white'
            }
          `}
          style={{
            backdropFilter: 'blur(10px)',
            boxShadow: error
              ? '0 4px 6px -1px rgba(248, 113, 113, 0.1), 0 2px 4px -1px rgba(248, 113, 113, 0.06)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}
        />
        {/* Focus ring enhancement */}
        <div
          className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 ${
            error ? 'opacity-0' : 'opacity-0 group-focus-within:opacity-100'
          }`}
          style={{
            background: 'linear-gradient(135deg, rgba(59, 183, 126, 0.05) 0%, transparent 50%, rgba(59, 183, 126, 0.05) 100%)'
          }}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};