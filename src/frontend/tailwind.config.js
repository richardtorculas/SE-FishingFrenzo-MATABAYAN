module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      /* ── Color tokens ── */
      colors: {
        surface: '#ffffff',
        muted:   '#f4f4f5',
        border:  '#e4e4e7',
        subtle:  '#71717a',
        ink:     '#18181b',
      },

      /* ── Shadow scale ── */
      boxShadow: {
        card:       '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        soft:       '0 2px 8px 0 rgba(0,0,0,0.06)',
        modal:      '0 20px 60px 0 rgba(0,0,0,0.15)',
      },

      /* ── Border radius ── */
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },

      /* ── Typography scale ── */
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },

      /* ── Spacing extras ── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      /* ── Transitions ── */
      transitionDuration: {
        150: '150ms',
      },

      /* ── Max widths ── */
      maxWidth: {
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
      },
    },
  },
  plugins: [],
};
