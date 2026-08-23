import React from 'react';
import { Users, ShieldCheck, Tag, FileSpreadsheet, Plus, Scan } from 'lucide-react';
import { Contact, RoleGroupResponse } from '../../types/contact';
import { downloadContactsCSV } from '../../utils/exportVCard';
import { useToast } from '../common/Toast';

interface StatsHeaderProps {
  contacts: Contact[];
  roleGroups: RoleGroupResponse[];
  onOpenScan: () => void;
  onOpenAddManual: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  contacts,
  roleGroups,
  onOpenScan,
  onOpenAddManual,
}) => {
  const { success } = useToast();

  const handleExportCSV = () => {
    if (contacts.length === 0) return;
    downloadContactsCSV(contacts);
    success('Contacts Exported', `Exported ${contacts.length} contacts to CSV.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner with Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Contact Intelligence Directory
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Transform physical business cards into categorized, searchable digital contacts with AI OCR.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportCSV}
            disabled={contacts.length === 0}
            style={{ fontSize: '0.875rem' }}
          >
            <FileSpreadsheet size={16} color="var(--accent-emerald)" /> Export CSV ({contacts.length})
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenAddManual}
            style={{ fontSize: '0.875rem' }}
          >
            <Plus size={16} /> Add Manually
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenScan}
            style={{ fontSize: '0.875rem', padding: '0.625rem 1.5rem' }}
          >
            <Scan size={18} /> Scan Business Card
          </button>
        </div>
      </div>

      {/* 3 Metric Mini Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Metric 1 */}
        <div
          className="glass-panel"
          style={{
            padding: '1.125rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {contacts.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Saved Contacts
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          className="glass-panel"
          style={{
            padding: '1.125rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tag size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {roleGroups.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Active Role Categories
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          className="glass-panel"
          style={{
            padding: '1.125rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#38bdf8' }}>
              Active
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Duplicate Defense Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
