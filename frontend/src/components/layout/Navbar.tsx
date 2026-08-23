import React from 'react';
import { CreditCard, Sun, Moon, Scan, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenScan: () => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onOpenScan,
  isBackendConnected,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.875rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <CreditCard size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '1.1875rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #f8fafc, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: theme === 'dark' ? 'transparent' : 'inherit',
                  color: 'var(--text-primary)',
                }}
              >
                CardFlow
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                AI OCR
              </span>
            </div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Business Card Intelligence Management
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Backend Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.3rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              background: isBackendConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${isBackendConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: isBackendConnected ? '#10b981' : '#f43f5e',
            }}
          >
            <Activity size={12} />
            <span>{isBackendConnected ? 'API Online' : 'API Offline'}</span>
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            className="btn-icon"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Scan Action */}
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenScan}
            style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
          >
            <Scan size={15} />
            <span>Scan Card</span>
            <Sparkles size={13} style={{ opacity: 0.8 }} />
          </button>
        </div>
      </div>
    </header>
  );
};
