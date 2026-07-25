/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-pink': '#FFB6C1',
        'rose-gold': '#B76E79',
        'lavender': '#E6E6FA',
        'baby-blue': '#BFEFFF',
        'lilac': '#C8A2C8',
        'cream': '#FFFDD0',
        'primary': '#FF6B9D',
        'primary-dark': '#E91E8C',
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Nunito', 'sans-serif'],
        'script': ['Dancing Script', 'cursive'],
      },
      borderRadius: {
        'xl2': '24px',
        'xl3': '32px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(255, 107, 157, 0.15)',
        'glass-hover': '0 12px 48px rgba(255, 107, 157, 0.22)',
      }
    },
  },
  plugins: [],
}
