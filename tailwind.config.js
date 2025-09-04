/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./popup/**/*.{js,ts,jsx,tsx}",
    "./options/**/*.{js,ts,jsx,tsx}",
    "./contents/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        highlight: {
          yellow: '#FFEB3B',
          green: '#4CAF50',
          blue: '#2196F3',
          pink: '#E91E63',
          orange: '#FF9800',
          purple: '#9C27B0',
          red: '#F44336',
          gray: '#9E9E9E'
        }
      },
      zIndex: {
        'highlight-popup': '2147483647',
        'highlight-marker': '2147483646',
        'highlight-overlay': '2147483645'
      },
      animation: {
        'fade-in-up': 'fadeInUp 150ms ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(4px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          }
        }
      },
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      spacing: {
        'popup': '8px',
        'color-btn': '24px'
      },
      borderRadius: {
        'popup': '8px',
        'color-btn': '4px'
      },
      boxShadow: {
        'popup': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'popup-hover': '0 6px 24px rgba(0, 0, 0, 0.2)'
      },
      backdropBlur: {
        'popup': '8px'
      }
    },
  },
  plugins: [
    // 自定义插件用于 WebNote 特殊样式
    function({ addUtilities, addComponents }) {
      addComponents({
        '.webnote-highlight-base': {
          position: 'relative',
          cursor: 'pointer',
          transition: 'opacity 150ms ease',
          borderRadius: '2px',
          padding: '1px 0',
        },
        '.webnote-popup-base': {
          position: 'fixed',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          padding: '8px',
          display: 'flex',
          gap: '4px',
          animation: 'fadeInUp 150ms ease',
        },
        '.webnote-color-btn-base': {
          width: '24px',
          height: '24px',
          borderRadius: '4px',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          display: 'block',
        }
      });
      
      addUtilities({
        '.z-highlight-popup': {
          zIndex: '2147483647'
        },
        '.z-highlight-marker': {
          zIndex: '2147483646'
        },
        '.z-highlight-overlay': {
          zIndex: '2147483645'
        }
      });
    }
  ],
  // 确保在不同环境下都能正常工作
  corePlugins: {
    preflight: false // 防止与页面样式冲突
  }
}