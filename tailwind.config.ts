import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        border: '#cbd5e1',
        accent: '#0ea5e9',
      },
    },
  },
  plugins: [],
};

export default config;
