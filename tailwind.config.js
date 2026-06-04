/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ['DM Sans', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        'sky-light':  '#d4eaf7',
        'sky-mid':    '#a8d4ef',
        'sky-deep':   '#5fa8d3',
        'sky-accent': '#2e86c1',
        'sky-dark':   '#1a5276',
        mist:         '#edf6fc',
        snow:         '#f8fcff',
        ink:          '#0d2b3e',
        stone:        '#4a6174',
        pebble:       '#8aa8bb',
        gold:         '#c9a84c',
      },
    },
  },
  plugins: [],
};
