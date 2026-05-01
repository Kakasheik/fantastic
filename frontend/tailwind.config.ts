import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Tema claro (Privacy-like)
        bg:        '#f7f3ec',   // creme do background
        surface1:  '#ffffff',   // cards brancos
        surface2:  '#faf6ee',   // hovers / superfícies secundárias
        border:    '#ece6da',
        text:      '#111111',
        muted:     '#8b8b8b',
        brand: {
          DEFAULT: '#ff5722',   // laranja "privacy"
          50:  '#fff4ef',
          100: '#ffe4d6',
          500: '#ff5722',
          600: '#e64a18',
          700: '#bf3c12',
        },
        accent: {
          DEFAULT: '#ff5722',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        'fade-in':  'fade-in 200ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
