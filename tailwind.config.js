/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './src/**/*.html',
    './src/js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        primaryLight: '#14b8a6',
        primaryDark: '#115e59',
        accent: '#d4f0ed',
        surface: '#f8fafc',
        card: '#ffffff',
        muted: '#64748b',
        border: '#e2e8f0',
        danger: '#b91c1c',
        warning: '#b45309',
        success: '#15803d',
      },
      outlineColor: {
        primary: '#0f766e',
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        lg: '16px',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        nav: '0 1px 3px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};
