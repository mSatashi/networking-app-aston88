import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { OCRStatus } from '../../types/contact';

interface ScanProgressProps {
  status: OCRStatus;
  previewUrl: string | null;
  errorMessage?: string | null;
  onRetry?: () => void;
  onCancel?: () => void;
}

const OCR_STAGES = [
  'Preprocessing image & enhancing contrast...',
  'Running Roboflow AI OCR extraction workflow...',
  'Parsing full name, email, phone & company...',
  'Classifying role category & checking duplicate database...',
];

export const ScanProgress: React.FC<ScanProgressProps> = ({
  status,
  previewUrl,
  errorMessage,
  onRetry,
  onCancel,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    if (status === 'processing' || status === 'uploading') {
      const interval = setInterval(() => {
        setCurrentStageIdx((prev) => (prev < OCR_STAGES.length - 1 ? prev + 1 : prev));
      }, 1400);
      return () => clearInterval(interval);
    } else {
      setCurrentStageIdx(0);
    }
  }, [status]);

  if (status === 'idle') return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.5rem',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Visual Scanning Frame */}
      {previewUrl && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '380px',
            aspectRatio: '16/9',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '2px solid var(--accent-primary)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          <img
            src={previewUrl}
            alt="Scanning Card"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Active Laser Scanning Beam */}
          {(status === 'processing' || status === 'uploading') && <div className="scan-beam" />}

          {/* Overlay Status Badge */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: status === 'processing' ? 'var(--accent-cyan)' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              zIndex: 20,
            }}
          >
            {status === 'uploading' && <Loader2 size={12} className="animate-spin" />}
            {status === 'processing' && <Loader2 size={12} className="animate-spin" />}
            {status === 'success' && <CheckCircle size={12} color="#10b981" />}
            {status === 'failed' && <AlertTriangle size={12} color="#f43f5e" />}
            {status === 'timeout' && <Clock size={12} color="#f59e0b" />}
            {status.toUpperCase()}
          </div>
        </div>
      )}

      {/* Status Details */}
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        {(status === 'uploading' || status === 'processing') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="pulse-dot" style={{ backgroundColor: 'var(--accent-cyan)' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {status === 'uploading' ? 'Uploading Card Image...' : 'AI Optical Character Recognition in Progress'}
              </h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {OCR_STAGES[currentStageIdx]}
            </p>

            {/* Stage Progress Pills */}
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem' }}>
              {OCR_STAGES.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '32px',
                    height: '4px',
                    borderRadius: '2px',
                    background: idx <= currentStageIdx ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
            <CheckCircle size={28} color="#10b981" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Extraction Successful!
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Please review and correct the extracted information below before saving.
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <AlertTriangle size={28} color="#f43f5e" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f43f5e' }}>
              OCR Extraction Failed
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {errorMessage || 'Unable to recognize business card text. Please ensure good lighting and clear text.'}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="btn-primary"
                style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}
              >
                <RefreshCw size={14} /> Retry OCR Scan
              </button>
            )}
          </div>
        )}

        {status === 'timeout' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <Clock size={28} color="#f59e0b" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
              Request Timed Out
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Roboflow OCR took longer than 45 seconds to respond. The image might be too large or the service is busy.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {onRetry && (
                <button type="button" onClick={onRetry} className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                  <RefreshCw size={14} /> Retry
                </button>
              )}
              {onCancel && (
                <button type="button" onClick={onCancel} className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
