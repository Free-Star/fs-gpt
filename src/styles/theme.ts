export interface Theme {
  primary: string
  primaryGradient: string
  secondary: string
  background: string
  surface: string
  border: string
  sidebarHover: string
  text: {
    primary: string
    secondary: string
    inverse: string
  }
}

export const themes = {
  light: {
    primary: '#4f46e5',
    primaryGradient: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
    secondary: '#f3f4f6',
    background: '#ffffff',
    surface: '#ffffff',
    'surface-rgb': '255, 255, 255',
    border: '#e5e7eb',
    sidebarHover: 'rgba(0, 0, 0, 0.05)',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      inverse: '#ffffff'
    }
  },
  dark: {
    primary: '#6366f1',
    primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    secondary: '#374151',
    background: '#111827',
    surface: '#1f2937',
    'surface-rgb': '31, 41, 55',
    border: '#374151',
    sidebarHover: 'rgba(255, 255, 255, 0.05)',
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
      inverse: '#111827'
    }
  },
  blue: {
    primary: '#2563eb',
    primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    secondary: '#eff6ff',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    sidebarHover: 'rgba(37, 99, 235, 0.05)',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      inverse: '#ffffff'
    }
  },
  green: {
    primary: '#059669',
    primaryGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    secondary: '#ecfdf5',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    sidebarHover: 'rgba(5, 150, 105, 0.05)',
    text: {
      primary: '#064e3b',
      secondary: '#047857',
      inverse: '#ffffff'
    }
  },
  orange: {
    primary: '#ea580c',
    primaryGradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
    secondary: '#fff7ed',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    sidebarHover: 'rgba(234, 88, 12, 0.05)',
    text: {
      primary: '#7c2d12',
      secondary: '#c2410c',
      inverse: '#ffffff'
    }
  }
} 