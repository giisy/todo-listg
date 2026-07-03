/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          card:      'rgb(var(--color-bg-card) / <alpha-value>)',
          elevated:  'rgb(var(--color-bg-elevated) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          subtle:  'rgb(var(--color-border-subtle) / <alpha-value>)',
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
          primary:   'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted:     'rgb(var(--color-text-muted) / <alpha-value>)',
          inverse:   'rgb(var(--color-text-inverse) / <alpha-value>)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: { '2xs': ['0.625rem', { lineHeight: '0.875rem' }] },
      borderRadius: { DEFAULT: '18px', sm: '8px', md: '12px', lg: '18px', xl: '24px' },
      boxShadow: {
        card:      'var(--shadow-card)',
        elevated:  'var(--shadow-elevated)',
        glow:      '0 0 20px rgba(59,130,246,0.2)',
        'glow-sm': '0 0 8px rgba(59,130,246,0.15)',
        modal:     'var(--shadow-modal)',
      },
      spacing: { sidebar: '280px' },
    },
  },
  plugins: [],
}