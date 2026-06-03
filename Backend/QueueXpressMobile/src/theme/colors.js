export const colors = {
  light: {
    primary: '#0099CC',
    secondary: '#00B140',
    dark: '#1E293B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#E2E8F0',
    status: {
      waiting: '#F59E0B',
      called: '#3B82F6',
      served: '#22C55E',
      skipped: '#EF4444',
    },
  },
  dark: {
    primary: '#0099CC',
    secondary: '#00B140',
    dark: '#F8FAFC',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#334155',
    status: {
      waiting: '#F59E0B',
      called: '#3B82F6',
      served: '#22C55E',
      skipped: '#EF4444',
    },
  },
};

export const getColors = (theme) => colors[theme] || colors.light;