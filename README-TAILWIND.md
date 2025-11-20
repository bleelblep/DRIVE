# Tailwind CSS Setup

This project now uses a self-hosted, production-ready Tailwind CSS build instead of the CDN.

## Development

To make changes to the styles:

1. Install dependencies (first time only):
   ```bash
   npm install
   ```

2. Make changes to `darkmode.css` or HTML files

3. Rebuild the CSS:
   ```bash
   npm run build:css
   ```

   Or watch for changes during development:
   ```bash
   npm run watch:css
   ```

## Production

The built CSS file (`dist/styles.css`) is included in the repository and should be committed whenever changes are made to styles or Tailwind classes are modified in HTML files.

## Files

- `package.json` - Node.js dependencies and build scripts
- `tailwind.config.js` - Tailwind CSS configuration
- `src/input.css` - Source CSS file (imports Tailwind and custom styles)
- `darkmode.css` - Custom dark mode styles
- `dist/styles.css` - Built, minified CSS file (used by all HTML pages)

## Why Self-Hosted?

The Tailwind CDN (`https://cdn.tailwindcss.com`) is convenient for prototyping but **not recommended for production** because:

1. **Performance** - Larger file size with all Tailwind utilities
2. **Reliability** - External dependency that could go down
3. **Security** - Reduces external dependencies
4. **Customization** - Allows for custom Tailwind configuration

The self-hosted build only includes the CSS classes actually used in the project, resulting in a much smaller file size.
