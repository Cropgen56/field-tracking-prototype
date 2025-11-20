export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
    },
    extend: {
      colors: {
        'cg-bg': '#354A3D',
        'cg-panel': '#0C2214',
        'cg-panel-2': '#1c3a31',
        'cg-accent': '#79C24A',
        'cg-accent-2': '#8cd96a',
        'cg-muted': '#9fb79f',
        'cg-yellow': '#f5b84c',
      },
      boxShadow: {
        'cg-soft': '0 6px 18px rgba(0,0,0,0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};