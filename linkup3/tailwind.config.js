export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#e6f0fa",
          100: "#cfe0f2",
          200: "#b7cfe9",
          300: "#9fbfe1",
          400: "#88afd8",
          500: "#6f9fcc",
          600: "#003049",
          700: "#022a40",
          800: "#022235",
          900: "#021b2b",
          DEFAULT: "#003049",
        },
        accent: {
          50: "#f0f7fb",
          100: "#d9ebf5",
          200: "#b3d7eb",
          300: "#669BBC",
          400: "#5589ad",
          500: "#44779e",
          600: "#33658f",
          700: "#225380",
          DEFAULT: "#669BBC",
        },
        neutral: {
          50: "#FAFAFB",
          100: "#F4F5F7",
          200: "#E9ECEF",
          300: "#DDE2E7",
          400: "#C1C8D1",
          500: "#9AA4B2",
          600: "#6B7280",
          700: "#4B5563",
          800: "#374151",
          900: "#1F2937",
        },
        success: { 
          DEFAULT: "#4CAF50",
          light: "#81C784",
          dark: "#388E3C" 
        },
        warning: { 
          DEFAULT: "#F7B731",
          light: "#FFD54F",
          dark: "#F57F17" 
        },
        danger: { 
          DEFAULT: "#E63946",
          light: "#EF5350",
          dark: "#C62828" 
        },
        info: {
          DEFAULT: "#2196F3",
          light: "#64B5F6",
          dark: "#1976D2"
        }
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        soft: "0 2px 8px rgba(0, 0, 0, 0.05)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.08)",
        strong: "0 8px 24px rgba(0, 0, 0, 0.12)",
        glow: "0 0 20px rgba(0, 48, 73, 0.15)",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.25rem",
      },
      transitionTimingFunction: {
        'soft': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
        slideUp: 'slideUp 350ms cubic-bezier(0.22, 1, 0.36, 1) both',
        slideDown: 'slideDown 350ms cubic-bezier(0.22, 1, 0.36, 1) both',
        slideRight: 'slideRight 350ms cubic-bezier(0.22, 1, 0.36, 1) both',
        pop: 'pop 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55) both',
        shimmer: 'shimmer 2s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
