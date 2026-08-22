import type {Config} from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
    './app/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './context/**/*.{js,jsx,ts,tsx,mdx}',
    './data/**/*.{js,jsx,ts,tsx,mdx}',
    './i18n/**/*.{js,jsx,ts,tsx,mdx}',
    './lib/**/*.{js,jsx,ts,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        zam: {
          green: {
            50: '#edfaf3',
            100: '#c2f0d8',
            200: '#90ddb5',
            400: '#2dba72',
            600: '#1a8a4f',
            700: '#126e3e',
            800: '#0e5c34',
            900: '#0a3520'
          },
          amber: {
            50: '#fff8e7',
            100: '#fce9b5',
            200: '#f5cc7a',
            400: '#e89c1f',
            500: '#d4830a',
            600: '#c06200',
            700: '#9c4e00',
            800: '#7a3d00'
          },
          red: '#e24b4a'
        },
        ink: {
          DEFAULT: '#1a1410',
          2: '#3d322a',
          3: '#6b5a4e',
          4: '#b8a898',
          5: '#e8e0d8',
          6: '#f5f1eb'
        },
        cream: {
          DEFAULT: '#faf7f2',
          dark: '#f0ebe0'
        }
      },
      fontFamily: {
        sans: ['var(--font-aicos-body)', 'sans-serif'],
        display: ['var(--font-aicos-heading)', 'var(--font-aicos-body)', 'sans-serif']
      },
      boxShadow: {
        'zam-sm': '0 1px 4px rgba(26,20,16,0.08)',
        'zam-md': '0 4px 16px rgba(26,20,16,0.10)',
        'zam-lg': '0 8px 32px rgba(26,20,16,0.12)',
        'zam-phone': '0 24px 80px rgba(0,0,0,0.35), 0 0 0 8px #1a1410, 0 0 0 10px #333'
      },
      borderRadius: {
        pill: '999px'
      }
    }
  }
};

export default config;
