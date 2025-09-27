/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New Custom Theme Colors
        primary: {
          50: '#f3f6f5',
          100: '#e7eeeb',
          200: '#ceddd6',
          300: '#a6c3b7',
          400: '#7aa498',
          500: '#5a8679',
          600: '#4a6d63',
          700: '#3e5a53',
          800: '#2f4742',
          900: '#1c332f', // Your primary color
          950: '#0f1c19',
        },
        secondary: {
          50: '#fdfcf8',
          100: '#faf8ef',
          200: '#f5f0dc',
          300: '#ede5c2',
          400: '#e4d7a4',
          500: '#e0d39f', // Your secondary color
          600: '#d4c485',
          700: '#c4b069',
          800: '#a6925a',
          900: '#87784d',
        },
        // Keep some existing colors for compatibility
        clover: {
          900: '#1c332f', // Match your primary
          700: '#4a6d63',
          500: '#7aa498',
          300: '#a6c3b7',
          100: '#f3f6f5',
        },
        accent: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
