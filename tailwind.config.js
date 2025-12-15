/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Microsoft YaHei', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: '#0a0a0a',
        secondary: '#4a4a4a',
        cream: '#f8f7f4',
        bg: '#f8f7f4',
        line: '#0a0a0a',
      },
      boxShadow: {
        'pill': '0 4px 20px rgba(0,0,0,0.05)',
        'pill-dark': '0 4px 20px rgba(255,255,255,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'liquid': 'liquid 3s ease infinite',
        'hourglass-flip': 'hourglassFlip 4s cubic-bezier(0.6, 0.05, 0.1, 1) infinite',
        'message-pop': 'messagePop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'message-pop-out': 'messagePopOut 0.3s ease-in forwards',
        'fade-out': 'fadeOut 0.3s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        liquid: {
          '0%': { 'background-size': '200% 200%', 'background-position': '0% 50%' },
          '50%': { 'background-size': '200% 200%', 'background-position': '100% 50%' },
          '100%': { 'background-size': '200% 200%', 'background-position': '0% 50%' },
        },
        hourglassFlip: {
          '0%, 80%': { transform: 'rotate(0deg)' }, /* Pause for sand to fall */
          '90%, 100%': { transform: 'rotate(180deg)' } /* Quick Flip */
        },
        messagePop: {
          '0%': { 
              opacity: '0', 
              transform: 'translateY(-10px) rotateX(-16deg) scale(0.92)', 
              filter: 'blur(32px) brightness(0.1)' 
          },
          '100%': { 
              opacity: '1', 
              transform: 'translateY(0) rotateX(0deg) scale(1)', 
              filter: 'blur(0px) brightness(1)' 
          }
        },
        messagePopOut: {
          '0%': { 
              opacity: '1', 
              transform: 'translateY(0) rotateX(0deg) scale(1)', 
              filter: 'blur(0px) brightness(1)' 
          },
          '100%': { 
              opacity: '0', 
              transform: 'translateY(-10px) rotateX(-16deg) scale(0.92)', 
              filter: 'blur(32px) brightness(0.1)' 
          }
        }
      }
    }
  },
  plugins: [],
}
