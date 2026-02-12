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
        // Primary: Deep navy - authority, trust
        navy: {
          50: '#e8eaf0',
          100: '#c6cad8',
          200: '#a1a8bf',
          300: '#7b86a6',
          400: '#5e6b93',
          500: '#425180',
          600: '#3a4877',
          700: '#303d6a',
          800: '#27335d',
          900: '#1B2A4A',
        },
        // Accent: Construction orange
        construction: {
          50: '#fff4e5',
          100: '#ffe3bf',
          200: '#ffd194',
          300: '#ffbe69',
          400: '#ffb048',
          500: '#E8740C',
          600: '#e69500',
          700: '#db8400',
          800: '#d17400',
          900: '#c05900',
        },
        // Safety yellow accent
        safety: {
          500: '#F5A623',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
