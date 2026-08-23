import React from 'react';
import { AlertTriangle, ExternalLink, UserCheck } from 'lucide-react';
import { Contact } from '../../types/contact';
import { Badge } from '../common/Badge';

interface DuplicateAlertProps {
  existingContact: Contact;
  onViewContact: (contact: Contact) => void;
  onDismiss?: () => void;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  existingContact,
  onViewContact,
}) => {
  return (
    <div
      style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            padding: '0.5rem',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#f59e0b',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#fbbf24' }}>
            Duplicate Contact Detected
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            The backend found a matching contact record (matched via email, phone, or name & company). To prevent duplicate entries, the existing record has been preserved.
          </p>
        </div>
      </div>

      {/* Existing Record Preview Card */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), #4f46e5)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.9375rem',
            }}
          >
            {existingContact.full_name?.charAt(0) || 'C'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              {existingContact.full_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
              {existingContact.job_title && `${existingContact.job_title} • `}
              {existingContact.company || 'No Company'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge role={existingContact.role} size="sm" />
          <button
            type="button"
            className="btn-primary"
            onClick={() => onViewContact(existingContact)}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
          >
            <UserCheck size={14} /> View Existing Contact <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
