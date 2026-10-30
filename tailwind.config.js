/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        solar: {
          50: '#FFFDF0',
          100: '#FFF9D2',
          200: '#FFF2A5',
          300: '#FFE772',
          400: '#FFDB43',
          DEFAULT: '#FFC62E',
          500: '#FFC62E',
          600: '#E5AB1C',
          700: '#B88310',
          800: '#8A5F0C',
          900: '#5C3C07',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#F7F3EA',
          300: '#EFE8DC',
          400: '#DED3C1',
        },
        bark: {
          900: '#261C14',
          800: '#3D3025',
          700: '#5C4B3D',
          600: '#7D6D5E',
          500: '#A19182',
          400: '#C7B9AC',
        },
        macro: {
          protein: '#E26D5C',
          carbs: '#EAA83B',
          fat: '#6B9080',
          water: '#3B82F6',
        },
        dark: {
          bg: '#161310',
          surface: '#221E19',
          card: '#28231D',
          elevated: '#322C24',
          border: '#3D352C',
          text: '#FAF6F0',
          muted: '#A89D91',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(45, 34, 20, 0.05)',
        'card': '0 10px 25px -5px rgba(45, 34, 20, 0.06), 0 8px 10px -6px rgba(45, 34, 20, 0.04)',
        'modal': '0 20px 40px -10px rgba(45, 34, 20, 0.15)',
        'floating': '0 12px 32px rgba(255, 198, 46, 0.35)',
      }
    },
  },
  plugins: [],
}
