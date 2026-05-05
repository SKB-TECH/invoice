import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        primary: 'var(--primary-color)',
        'primary-foreground': 'var(--primary-color-foreground)',
      }
    },
  },
  plugins: [],
};

export default config;
