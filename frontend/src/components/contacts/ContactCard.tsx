import React from 'react';
import { Mail, Phone, Globe, Building, Download, Copy, Check } from 'lucide-react';
import { Contact } from '../../types/contact';
import { Badge } from '../common/Badge';
import { downloadVCard } from '../../utils/exportVCard';
import { useToast } from '../common/Toast';

interface ContactCardProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onSelect }) => {
  const { success } = useToast();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const copyToClipboard = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    success('Copied to clipboard', `${label}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadVCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadVCard(contact);
    success('vCard Downloaded', `${contact.full_name}.vcf has been saved.`);
  };

  return (
    <div
      onClick={() => onSelect(contact)}
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: 'pointer',
        position: 'relative',
        height: '100%',
        justifyContent: 'space-between',
      }}
    >
      {/* Top row: Avatar, Info & Role Badge */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
              }}
            >
              {getInitials(contact.full_name || 'U')}
            </div>
            <div>
              <h4
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {contact.full_name}
              </h4>
              {contact.job_title && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', fontWeight: 500, marginTop: '0.125rem' }}>
                  {contact.job_title}
                </p>
              )}
            </div>
          </div>
          <Badge role={contact.role} size="sm" />
        </div>

        {/* Company & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.875rem' }}>
          {contact.company && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <Building size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 500 }}>{contact.company}</span>
            </div>
          )}

          {contact.email && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <Mail size={14} color="var(--text-muted)" />
              <span>{contact.email}</span>
            </div>
          )}

          {(contact.phone || contact.mobile) && (
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <Phone size={14} color="var(--text-muted)" />
              <span>{contact.phone || contact.mobile}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          marginTop: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              onClick={(e) => e.stopPropagation()}
              className="btn-icon"
              title={`Send Email to ${contact.email}`}
            >
              <Mail size={15} />
            </a>
          )}
          {(contact.phone || contact.mobile) && (
            <a
              href={`tel:${contact.phone || contact.mobile}`}
              onClick={(e) => e.stopPropagation()}
              className="btn-icon"
              title={`Call ${contact.phone || contact.mobile}`}
            >
              <Phone size={15} />
            </a>
          )}
          {contact.website && (
            <a
              href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="btn-icon"
              title={`Visit website ${contact.website}`}
            >
              <Globe size={15} />
            </a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {contact.email && (
            <button
              type="button"
              className="btn-icon"
              onClick={(e) => copyToClipboard(e, contact.email!, 'Email')}
              title="Copy Email"
            >
              {copiedField === 'Email' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            </button>
          )}
          <button
            type="button"
            className="btn-icon"
            onClick={handleDownloadVCard}
            title="Download vCard (.vcf)"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
