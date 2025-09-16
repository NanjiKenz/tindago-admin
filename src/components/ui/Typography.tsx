/**
 * Typography Component
 *
 * Simple typography components using Tailwind CSS
 */

'use client';

import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const H1: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h1 className={`text-3xl font-bold text-gray-900 ${className}`}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-semibold text-gray-900 ${className}`}>
    {children}
  </h2>
);

export const H3: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-medium text-gray-900 ${className}`}>
    {children}
  </h3>
);

export const Body: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-base text-gray-700 ${className}`}>
    {children}
  </p>
);

export const Caption: React.FC<TypographyProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

// Default Typography component
interface FullTypographyProps extends TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
}

export const Typography: React.FC<FullTypographyProps> = ({
  variant = 'body',
  children,
  className = ''
}) => {
  switch (variant) {
    case 'h1':
      return <H1 className={className}>{children}</H1>;
    case 'h2':
      return <H2 className={className}>{children}</H2>;
    case 'h3':
      return <H3 className={className}>{children}</H3>;
    case 'body':
      return <Body className={className}>{children}</Body>;
    case 'caption':
      return <Caption className={className}>{children}</Caption>;
    default:
      return <Body className={className}>{children}</Body>;
  }
};