/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F1115',
          secondary: '#13161B',
          card: '#1A1E24',
          elevated: '#1E2229',
        },
        border: {
          DEFAULT: '#2A2F38',
          subtle: '#1F2430',
          focus: '#3B82F6',
        },
        accent: {
          blue: '#3B82F6',
          'blue-dim': '#1D4ED8',
          'blue-glow': 'rgba(59,130,246,0.15)',
          purple: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#9CA3AF',
          muted: '#4B5563',
          inverse: '#0F1115',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        DEFAULT: '18px',
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        elevated: '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        glow: '0 0 20px rgba(59,130,246,0.2)',
        'glow-sm': '0 0 8px rgba(59,130,246,0.15)',
        modal: '0 24px 64px rgba(0,0,0,0.7)',
      },
      spacing: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
}