const { '[data-theme=light]': lightTheme } = require('daisyui/src/colors/themes');

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
    }
  },

  plugins: [require('daisyui'), require('tw-elements/dist/plugin')],

  daisyui: {
    themes: [
      {
        // overriding some properties of the light theme we are using
        light: {
          ...lightTheme,
          accent: '#2aa79b',
          'accent-focus': '#009485',
          'accent-content': '#ffffff'
        }
      }
    ]
  }
};

module.exports = config;
