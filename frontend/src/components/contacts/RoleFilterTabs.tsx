import React from 'react';
import { ROLE_OPTIONS, RoleCategory, RoleGroupResponse } from '../../types/contact';
import { getRoleStyle } from '../../utils/roleColors';

interface RoleFilterTabsProps {
  selectedRole: RoleCategory;
  onSelectRole: (role: RoleCategory) => void;
  roleGroups: RoleGroupResponse[];
  totalContacts: number;
}

export const RoleFilterTabs: React.FC<RoleFilterTabsProps> = ({
  selectedRole,
  onSelectRole,
  roleGroups,
  totalContacts,
}) => {
  const getCountForRole = (roleName: string) => {
    if (roleName === 'All') return totalContacts;
    const group = roleGroups.find((g) => g.role.toLowerCase() === roleName.toLowerCase());
    return group ? group.count : 0;
  };

  const allRoles: RoleCategory[] = ['All', ...ROLE_OPTIONS];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
        scrollbarWidth: 'none',
      }}
    >
      {allRoles.map((role) => {
        const isSelected = selectedRole === role;
        const count = getCountForRole(role);
        const style = role !== 'All' ? getRoleStyle(role) : null;

        return (
          <button
            key={role}
            type="button"
            onClick={() => onSelectRole(role)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.875rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: isSelected ? 700 : 500,
              whiteSpace: 'nowrap',
              background: isSelected
                ? role === 'All'
                  ? 'var(--accent-primary)'
                  : style?.bg || 'var(--accent-primary)'
                : 'var(--bg-surface)',
              color: isSelected
                ? role === 'All'
                  ? '#ffffff'
                  : style?.text || '#ffffff'
                : 'var(--text-secondary)',
              border: isSelected
                ? `1px solid ${role === 'All' ? 'var(--accent-primary)' : style?.border || 'var(--accent-primary)'}`
                : '1px solid var(--border-color)',
              boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {role !== 'All' && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: style?.dot || '#6366f1',
                }}
              />
            )}
            <span>{role}</span>
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                background: isSelected
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
