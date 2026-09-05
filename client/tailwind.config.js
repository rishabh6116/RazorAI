/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        surface: '#0F172A',
        panel: '#131C31',
        accent: {
          DEFAULT: '#6D5EF7',
          light: '#8B7CFF',
          dark: '#4F3EE0',
        },
        mint: '#22D3A6',
        coral: '#FF6B6B',
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(109, 94, 247, 0.45)',
        card: '0 10px 30px -12px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
