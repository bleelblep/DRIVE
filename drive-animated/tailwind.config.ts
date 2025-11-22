import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette (dark brutalism inspired by msmsmsm.com)
        'archive-black': '#0D0D0D',      // Main background
        'archive-charcoal': '#1A1A1A',   // Elevated surfaces
        'archive-white': '#FFFFFF',       // Primary text
        'archive-gray': '#808080',        // Secondary text

        // Accent colors (for collection categories)
        'archive-violet': '#8B5CF6',     // Music
        'archive-cyan': '#06B6D4',       // Videos
        'archive-pink': '#EC4899',       // Photos
        'archive-emerald': '#10B981',    // Interviews
        'archive-amber': '#F59E0B',      // Misc
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        'archive-wide': '0.42px',        // msmsmsm.com spacing
        'archive-wider': '1px',
        'archive-widest': '2px',
      },
      lineHeight: {
        'dramatic': '75px',              // msmsmsm.com dramatic spacing
      },
      backdropBlur: {
        'archive-sm': '8px',
        'archive-md': '20px',
        'archive-lg': '40px',
      },
    },
  },
  plugins: [],
};

export default config;
