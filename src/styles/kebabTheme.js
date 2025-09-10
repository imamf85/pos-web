export const kebabTheme = {
  colors: {
    // Primary colors - warm Middle Eastern palette
    primary: '#ea580c', // Orange
    primaryDark: '#dc2626', // Dark red
    primaryLight: '#fb923c', // Light orange
    
    // Secondary colors
    secondary: '#fbbf24', // Amber
    secondaryDark: '#f59e0b',
    secondaryLight: '#fcd34d',
    
    // Background colors
    bgPrimary: '#fef3c7', // Light cream
    bgSecondary: '#fed7aa', // Peach
    bgTertiary: '#fecaca', // Light pink
    
    // Text colors
    textPrimary: '#92400e', // Brown
    textSecondary: '#ea580c', // Orange
    textDark: '#451a03', // Dark brown
    textLight: '#d97706', // Light orange
    
    // UI colors
    white: '#ffffff',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#2563eb',
    
    // Gradients
    gradientPrimary: 'linear-gradient(to right, #fbbf24, #f97316, #ef4444)',
    gradientSecondary: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(254,243,199,0.95) 100%)',
    gradientBackground: 'linear-gradient(to bottom right, #fef3c7, #fed7aa, #fecaca)'
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px'
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  
  transitions: {
    fast: 'all 0.15s ease',
    base: 'all 0.3s ease',
    slow: 'all 0.5s ease'
  }
};

// Common component styles
export const commonStyles = {
  container: {
    minHeight: '100vh',
    background: kebabTheme.colors.gradientBackground,
    fontFamily: kebabTheme.typography.fontFamily
  },
  
  card: {
    background: kebabTheme.colors.gradientSecondary,
    borderRadius: kebabTheme.borderRadius['2xl'],
    padding: kebabTheme.spacing['2xl'],
    boxShadow: kebabTheme.shadows['2xl'],
    border: `1px solid ${kebabTheme.colors.bgSecondary}`,
    backdropFilter: 'blur(8px)'
  },
  
  button: {
    base: {
      padding: `${kebabTheme.spacing.md} ${kebabTheme.spacing.xl}`,
      borderRadius: kebabTheme.borderRadius.lg,
      fontWeight: kebabTheme.typography.fontWeight.semibold,
      transition: kebabTheme.transitions.base,
      cursor: 'pointer',
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: kebabTheme.spacing.sm
    },
    primary: {
      background: kebabTheme.colors.gradientPrimary,
      color: kebabTheme.colors.white,
      boxShadow: kebabTheme.shadows.lg
    },
    secondary: {
      background: kebabTheme.colors.white,
      color: kebabTheme.colors.primary,
      border: `2px solid ${kebabTheme.colors.primary}`
    }
  },
  
  input: {
    padding: `${kebabTheme.spacing.md} ${kebabTheme.spacing.lg}`,
    borderRadius: kebabTheme.borderRadius.md,
    border: `1px solid ${kebabTheme.colors.bgSecondary}`,
    fontSize: kebabTheme.typography.fontSize.base,
    transition: kebabTheme.transitions.base,
    width: '100%',
    background: 'rgba(255, 255, 255, 0.8)',
    '&:focus': {
      outline: 'none',
      borderColor: kebabTheme.colors.primary,
      boxShadow: `0 0 0 3px ${kebabTheme.colors.primaryLight}20`
    }
  },
  
  heading: {
    h1: {
      fontSize: kebabTheme.typography.fontSize['4xl'],
      fontWeight: kebabTheme.typography.fontWeight.bold,
      background: 'linear-gradient(to right, #b45309, #ea580c, #dc2626)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    h2: {
      fontSize: kebabTheme.typography.fontSize['3xl'],
      fontWeight: kebabTheme.typography.fontWeight.bold,
      color: kebabTheme.colors.textPrimary
    },
    h3: {
      fontSize: kebabTheme.typography.fontSize['2xl'],
      fontWeight: kebabTheme.typography.fontWeight.semibold,
      color: kebabTheme.colors.textPrimary
    }
  }
};

// Helper function to merge styles
export const mergeStyles = (...styles) => {
  return Object.assign({}, ...styles);
};