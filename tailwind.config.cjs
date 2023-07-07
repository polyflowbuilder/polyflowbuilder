const { '[data-theme=light]': lightTheme } = require('daisyui/src/theming/themes');
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

  plugins: [require('daisyui'), require('tw-elements/dist/plugin')],

  daisyui: {
    themes: [
      {
        // TODO: hardcode light theme into here so we don't get theme changes
        // when updating daisyUI
        // overriding some properties of the light theme we are using
        // need to restart dev server for changes to take effect
        light: {
          ...lightTheme,
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
