/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          card:      'var(--color-bg-card)',
          elevated:  'var(--color-bg-elevated)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle:  'var(--color-border-subtle)',
          focus:   '#3B82F6',
        },
        accent: {
          blue:        '#3B82F6',
          'blue-dim':  '#1D4ED8',
          'blue-glow': 'rgba(59,130,246,0.15)',
          purple:      '#8B5CF6',
          emerald:     '#10B981',
          amber:       '#F59E0B',
          rose:        '#F43F5E',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
          inverse:   'var(--color-text-inverse)',
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
        card:     'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        glow:     '0 0 20px rgba(59,130,246,0.2)',
        'glow-sm':'0 0 8px rgba(59,130,246,0.15)',
        modal:    'var(--shadow-modal)',
      },
      spacing: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
}