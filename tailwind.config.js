/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6366f1",        // Indigo - Primary brand color
          secondary: "#8b5cf6",      // Violet - Secondary
          accent: "#ec4899",         // Pink/Magenta - Vibrant accent
          success: "#10b981",        // Emerald for success states
          urgent: "#ef4444",         // Red for emergency
          warning: "#f59e0b",        // Amber for alerts
          dark: "#0f172a",           // Very dark slate
          light: "#f8f7ff",          // Light purple tint
        },
        medical: {
          primary: "#6366f1",        // Indigo
          secondary: "#8b5cf6",      // Violet
          accent: "#ec4899",         // Pink Accent
          success: "#10b981",        // Emerald
          urgent: "#ef4444",         // Red
          warning: "#f59e0b",        // Amber
          light: "#eef2ff",          // Indigo light
          lighter: "#faf5ff",        // Violet light
        }
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
