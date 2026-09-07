/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#0F1B2D', 800: '#152238', 700: '#1F3350', 600: '#2B4568' },
        evergreen: { 600: '#1F7A5C', 700: '#186349', 100: '#E4F2EC' },
        amber: { 500: '#E0A438', 600: '#C4872A', 100: '#FBF0DC' },
        mist: { 50: '#F6F8FA', 100: '#EEF1F5', 200: '#E2E7ED' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
}
