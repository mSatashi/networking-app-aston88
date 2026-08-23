import React, { useState } from 'react';
import { Mail, Phone, Globe, MapPin, Download, Trash2, Copy, Check, Calendar, ShieldCheck } from 'lucide-react';
import { Contact } from '../../types/contact';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { downloadVCard } from '../../utils/exportVCard';
import { useToast } from '../common/Toast';

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onDelete,
}) => {
  const { success } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!contact) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    success('Copied', `${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDelete = async () => {
    if (!contact.id) return;
    setIsDeleting(true);
    try {
      await onDelete(contact.id);
      setShowConfirmDelete(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Contact Profile</span>
          <Badge role={contact.role} />
        </div>
      }
      subtitle={`Database Record #${contact.id ?? 'New'}`}
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
            }}
          >
            {contact.full_name?.charAt(0) || 'C'}
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {contact.full_name}
            </h3>
            {contact.job_title && (
              <p style={{ fontSize: '0.875rem', color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '0.125rem' }}>
                {contact.job_title}
              </p>
            )}
            {contact.company && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                {contact.company}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info Rows */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            background: 'var(--bg-surface)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}
        >
          {/* Email */}
          {contact.email && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={16} color="var(--accent-primary)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                  <a
                    href={`mailto:${contact.email}`}
                    style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => copyToClipboard(contact.email!, 'Email')}
                title="Copy Email"
              >
                {copiedKey === 'Email' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Phone */}
          {(contact.phone || contact.mobile) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={16} color="var(--accent-emerald)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone / Mobile</div>
                  <a
                    href={`tel:${contact.phone || contact.mobile}`}
                    style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}
                  >
                    {contact.phone || contact.mobile}
                  </a>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => copyToClipboard(contact.phone || contact.mobile!, 'Phone')}
                title="Copy Phone"
              >
                {copiedKey === 'Phone' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Website */}
          {contact.website && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Globe size={16} color="var(--accent-cyan)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Website</div>
                  <a
                    href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-cyan)', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'underline' }}
                  >
                    {contact.website}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.375rem 0', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin size={16} color="var(--accent-rose)" style={{ marginTop: '3px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.4 }}>
                    {contact.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {contact.created_at && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem 0', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Calendar size={14} />
              <span>Added on {new Date(contact.created_at).toLocaleString()}</span>
              <ShieldCheck size={14} color="#10b981" style={{ marginLeft: 'auto' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Verified Record</span>
            </div>
          )}
        </div>

        {/* Delete Confirmation Box */}
        {showConfirmDelete ? (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fb7185' }}>
              Are you sure you want to delete this contact permanently?
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowConfirmDelete(false)}
                disabled={isDeleting}
                style={{ fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ fontSize: '0.8125rem' }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Contact'}
              </button>
            </div>
          </div>
        ) : (
          /* Bottom Action Bar */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-danger"
              onClick={() => setShowConfirmDelete(true)}
              style={{ fontSize: '0.8125rem' }}
            >
              <Trash2 size={15} /> Delete Contact
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  downloadVCard(contact);
                  success('vCard Saved', `${contact.full_name}.vcf has been exported.`);
                }}
              >
                <Download size={15} /> Export vCard
              </button>
              <button type="button" className="btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
