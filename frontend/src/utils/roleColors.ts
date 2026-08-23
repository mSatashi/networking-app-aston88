export interface RoleStyle {
  bg: string;
  text: string;
  border: string;
  gradient: string;
  dot: string;
  iconName: string;
}

export const ROLE_STYLES: Record<string, RoleStyle> = {
  Executive: {
    bg: 'rgba(147, 51, 234, 0.12)',
    text: '#c084fc',
    border: 'rgba(168, 85, 247, 0.3)',
    gradient: 'linear-gradient(135deg, #9333ea, #6366f1)',
    dot: '#a855f7',
    iconName: 'Crown',
  },
  Management: {
    bg: 'rgba(59, 130, 246, 0.12)',
    text: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.3)',
    gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    dot: '#3b82f6',
    iconName: 'Briefcase',
  },
  Engineering: {
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.3)',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    dot: '#10b981',
    iconName: 'Code',
  },
  'Sales & Marketing': {
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.3)',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    dot: '#f59e0b',
    iconName: 'TrendingUp',
  },
  'Product & Design': {
    bg: 'rgba(236, 72, 153, 0.12)',
    text: '#f472b6',
    border: 'rgba(236, 72, 153, 0.3)',
    gradient: 'linear-gradient(135deg, #db2777, #ec4899)',
    dot: '#ec4899',
    iconName: 'Palette',
  },
  'Operations & Admin': {
    bg: 'rgba(14, 165, 233, 0.12)',
    text: '#38bdf8',
    border: 'rgba(14, 165, 233, 0.3)',
    gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    dot: '#0ea5e9',
    iconName: 'Layers',
  },
  General: {
    bg: 'rgba(148, 163, 184, 0.12)',
    text: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.3)',
    gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
    dot: '#94a3b8',
    iconName: 'User',
  },
};

export function getRoleStyle(role?: string | null): RoleStyle {
  if (!role || !ROLE_STYLES[role]) {
    return ROLE_STYLES.General;
  }
  return ROLE_STYLES[role];
}
