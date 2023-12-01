const defaultTheme = require('tailwindcss/defaultTheme');

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/tw-elements/dist/js/**/*.js'],

  theme: {
    extend: {
      // put extra color defs here so we don't override defaults
      colors: {
        polyGreen: {
          DEFAULT: '#1b733c'
        },
        blueLink: {
          DEFAULT: '#007bff'
        }
      }
    },
    screens: {
      xxs: '375px',
      xs: '475px',
      ...defaultTheme.screens
    }
  },

  plugins: [require('daisyui'), require('tw-elements/dist/plugin.cjs')],

  daisyui: {
    themes: [
      {
        // need to restart dev server for changes to take effect
        light: {
          // original light theme
          'color-scheme': 'light',
          primary: '#570df8',
          'primary-content': '#E0D2FE',
          secondary: '#f000b8',
          'secondary-content': '#FFD1F4',
          accent: '#1ECEBC',
          'accent-content': '#07312D',
          neutral: '#2B3440',
          'neutral-content': '#D7DDE4',
          'base-100': '#ffffff',
          'base-200': '#F2F2F2',
          'base-300': '#E5E6E6',
          'base-content': '#1f2937',
          // overrides
          primary: '#d1d5db', // base-300
          accent: '#2aa79b',
          'accent-focus': '#009485',
          'accent-content': '#ffffff'
        }
      }
    ]
  }
};

module.exports = config;
