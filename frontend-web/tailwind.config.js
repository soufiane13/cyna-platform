/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ta palette "Deep Space"
        cyna: {
          navy: '#0B0E14',      // Background
          steel: '#1C2128',     // Surface / Cards
          cyan: '#00F0FF',      // Primary / Glow
          'cyan-dim': 'rgba(0, 240, 255, 0.4)', // Pour les ombres
          white: '#F0F6FC',     // Headings
          text: '#A0A0A0',      // Body text
          success: '#00FF94',   // Available
          error: '#FF3B3B',     // Stock exhausted / Error
          warning: '#FF9900',   // Alert
          
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'], // Ta police préférée
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 240, 255, 0.4)', // Ton effet "Glow"
        'card': '0 10px 30px rgba(0, 0, 0, 0.3)',  // Ton effet "Floating"
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #00F0FF 0%, #0088FF 100%)', // Ton dégradé bouton
      },
      // --- AJOUTS POUR L'ANIMATION ---
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' }, // Le mouvement de flottement
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}