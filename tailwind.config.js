/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1F1D1B',
        secondary: '#7D7D7D',
        accent: '#B0B0B0',
        surface: '#2A2825',
        border: '#3A3836',
        gold: '#C9A84C',
        'gold-dim': '#8B7335',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'display-xl': ['62px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-lg': ['38px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      spacing: {
        phi: '1.618rem',
        'phi-sm': '0.618rem',
        'phi-lg': '2.618rem',
        'phi-xl': '4.236rem',
      },
      aspectRatio: {
        golden: '1.618 / 1',
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 12px 48px rgba(0,0,0,0.6)',
        glow: '0 0 24px rgba(201,168,76,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
