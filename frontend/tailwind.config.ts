import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          highlight: '#4B164C',
          primary: '#4B164C',
          hover: '#381039',
          accent: '#DD88CF',
        },
        surface: {
          DEFAULT: '#F5F5F5',
          card: '#ffffff',
          border: '#e2e8f0',
          hover: '#F8E7F6',
          input: '#ffffff',
          sidebar: '#4B164C',
        },
        text: {
          primary: '#1e1b1e',
          secondary: '#5c545b',
          muted: '#a396a1',
          inverse: '#fdfbfe',
        },
        accent: {
          plum: '#4B164C',
          rose: '#DD88CF',
          emerald: '#10B981',
          amber: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4B164C 0%, #381039 100%)',
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(37, 99, 235, 0.25)',
        card: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        xl: '0.5rem',
        '2xl': '0.625rem',
      },
    },
  },
  plugins: [],
};

export default config;
