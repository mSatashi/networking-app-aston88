import React, { useState } from 'react';
import { LayoutGrid, List as ListIcon, UserX, Scan } from 'lucide-react';
import { Contact } from '../../types/contact';
import { ContactCard } from './ContactCard';
import { Badge } from '../common/Badge';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onSelectContact: (contact: Contact) => void;
  onOpenScan: () => void;
  searchQuery: string;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isLoading,
  onSelectContact,
  onOpenScan,
  searchQuery,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (isLoading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="glass-panel"
            style={{ height: '180px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="skeleton" style={{ width: '46px', height: '46px', borderRadius: '8px' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div className="skeleton" style={{ width: '60%', height: '18px' }} />
                <div className="skeleton" style={{ width: '40%', height: '14px' }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: '80%', height: '14px', marginTop: '0.5rem' }} />
            <div className="skeleton" style={{ width: '50%', height: '14px' }} />
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <UserX size={30} />
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {searchQuery ? `No contacts matching "${searchQuery}"` : 'No Contacts in Directory Yet'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0.5rem auto 0' }}>
            {searchQuery
              ? 'Try adjusting your search keywords or switching to the "All" role filter.'
              : 'Start by scanning your first physical business card or adding one manually.'}
          </p>
        </div>

        {!searchQuery && (
          <button type="button" onClick={onOpenScan} className="btn-primary" style={{ marginTop: '0.5rem' }}>
            <Scan size={16} /> Scan Business Card
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header controls: Results Count & View Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Showing <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{contacts.length}</span> contact{contacts.length === 1 ? '' : 's'}
        </div>

        <div
          style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            padding: '2px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.375rem 0.625rem',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'list' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
            }}
            title="List View"
          >
            <ListIcon size={15} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {contacts.map((c) => (
            <ContactCard key={c.id ?? c.full_name} contact={c} onSelect={onSelectContact} />
          ))}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {contacts.map((c) => (
            <div
              key={c.id ?? c.full_name}
              onClick={() => onSelectContact(c)}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '0.875rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '220px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                  }}
                >
                  {c.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {c.full_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {c.job_title && `${c.job_title} `}
                    {c.company && `• ${c.company}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', minWidth: '160px' }}>
                  {c.email || c.phone || 'No contact details'}
                </div>
                <Badge role={c.role} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
