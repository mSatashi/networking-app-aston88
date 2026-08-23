import React from 'react';
import { getRoleStyle } from '../../utils/roleColors';

interface BadgeProps {
  role?: string | null;
  children?: React.ReactNode;
  variant?: 'role' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  role,
  children,
  variant = 'role',
  size = 'md',
  showDot = true,
}) => {
  if (variant === 'role' || role) {
    const style = getRoleStyle(role);
    return (
      <span
        className="badge"
        style={{
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
          padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.625rem',
        }}
      >
        {showDot && (
          <span
            style={{
              width: size === 'sm' ? '5px' : '6px',
              height: size === 'sm' ? '5px' : '6px',
              borderRadius: '50%',
              backgroundColor: style.dot,
            }}
          />
        )}
        {children || role || 'General'}
      </span>
    );
  }

  const variantStyles = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', dot: '#10b981' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
    error: { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)', dot: '#f43f5e' },
    info: { bg: 'rgba(6, 182, 212, 0.15)', text: '#38bdf8', border: 'rgba(6, 182, 212, 0.3)', dot: '#06b6d4' },
    neutral: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)', dot: '#94a3b8' },
  }[variant];

  return (
    <span
      className="badge"
      style={{
        backgroundColor: variantStyles.bg,
        color: variantStyles.text,
        border: `1px solid ${variantStyles.border}`,
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.625rem',
      }}
    >
      {showDot && (
        <span
          style={{
            width: size === 'sm' ? '5px' : '6px',
            height: size === 'sm' ? '5px' : '6px',
            borderRadius: '50%',
            backgroundColor: variantStyles.dot,
          }}
        />
      )}
      {children}
    </span>
  );
};
