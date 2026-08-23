import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

interface CardUploaderProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  previewUrl: string | null;
  disabled?: boolean;
}

// Sample card images for one-click testing
const SAMPLE_CARDS = [
  {
    name: 'Tech Executive (CTO)',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    desc: 'Sample Modern Tech Card',
  },
  {
    name: 'Product Designer',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    desc: 'Sample Creative Studio Card',
  },
];

export const CardUploader: React.FC<CardUploaderProps> = ({
  onFileSelect,
  onUrlSubmit,
  previewUrl,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelectFile = (file: File) => {
    setErrorMsg(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg('Please enter an image URL.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMsg('Please enter a valid HTTP or HTTPS URL.');
      return;
    }
    onUrlSubmit(trimmed);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Upload Mode Tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: activeTab === 'file' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'file' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          <Upload size={16} /> Upload Image File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: activeTab === 'url' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'url' ? '#ffffff' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          <LinkIcon size={16} /> Image Web URL
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Tab 1: File Drop Zone */}
      {activeTab === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                validateAndSelectFile(e.target.files[0]);
              }
            }}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragOver ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              background: isDragOver ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={26} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                Click to browse or drag & drop card image
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supports JPEG, PNG, WebP up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: URL Input */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="form-group">
            <label className="form-label">
              <LinkIcon size={14} /> Direct Image URL
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/card.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={disabled || !urlInput.trim()}
                style={{ flexShrink: 0 }}
              >
                <Sparkles size={16} /> Load Image
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Quick Test Demo Samples */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          OR TRY A SAMPLE BUSINESS CARD:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {SAMPLE_CARDS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrlInput(sample.url);
                onUrlSubmit(sample.url);
              }}
              disabled={disabled}
              style={{
                textAlign: 'left',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
              }}
            >
              <ImageIcon size={16} color="var(--accent-cyan)" />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sample.name}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{sample.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      {previewUrl && (
        <div
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            aspectRatio: '16/9',
            maxHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={previewUrl}
            alt="Business Card Preview"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
};
