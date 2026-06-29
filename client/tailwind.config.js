module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // High-End Minimalist Palette
        'dark-bg': {
          primary: '#1a1a1a',
          secondary: '#1f1f1f',
          darker: '#151515',
        },
        // Warm Neutral Accents
        'warm': {
          beige: '#d4bba3',
          light: '#e8d4c0',
          cream: '#f5ead8',
          orange: '#c99d7a',
          dark: '#b8957a',
        },
        // Text Colors
        'text': {
          light: '#e0e0e0',
          medium: '#b0b0b0',
          dark: '#808080',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
