/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./layout/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Existing variables
        background: "var(--background)",
        foreground: "var(--foreground)",

        // New custom colors
        primary: {
          deepBlue: "var(--primary-deep-blue)", // For primary buttons, headers
          teal: "var(--primary-teal)", // For highlights or secondary actions
        },
        accent: {
          sunsetOrange: "var(--accent-sunset-orange)", // For warnings, alerts, call-to-action buttons
          softYellow: "var(--accent-soft-yellow)", // For highlights, badges, subtle notifications
        },
        neutral: {
          darkCharcoal: "var(--neutral-dark-charcoal)", // For text and dark backgrounds
          slateGray: "var(--neutral-slate-gray)", // For borders, dividers, secondary text
          lightGray: "var(--neutral-light-gray)", // For backgrounds and card shadows
        },
        status: {
          successGreen: "var(--status-success-green)", // To indicate success, confirmations
          errorRed: "var(--status-error-red)", // For errors, declines, critical alerts
        },
        typography: {
          midnightBlue: "var(--typography-midnight-blue)", // For main headings and titles
          gunmetal: "var(--typography-gunmetal)", // For subheadings and body text
        },
      },
    },
  },
  plugins: [],
};
