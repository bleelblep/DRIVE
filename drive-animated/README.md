# The Drive - Animated Next.js Rebuild

Dark brutalist animated rebuild of The SOPHIE Archive using Next.js 14, Framer Motion, and Tailwind CSS.

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```

Static files will be exported to `out/` directory.

## 🌐 Deploy to GitHub Pages

### One-Time Setup

1. Go to your GitHub repository settings
2. Navigate to **Settings > Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Save

### Automatic Deployment

The site will automatically deploy to GitHub Pages when you push to:
- `main` branch
- `claude/framer-animation-plan-01F69YyGtqLBUk6ngwdVaDTy` branch

Your site will be available at:
```
https://<your-username>.github.io/DRIVE/
```

### Manual Deployment

Trigger a deployment manually:
1. Go to **Actions** tab in GitHub
2. Click "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## 🎨 Design System

- **Aesthetic**: Dark brutalism inspired by msmsmsm.com
- **Colors**: Ultra-dark (#0D0D0D) with high contrast white text
- **Typography**: Bold, uppercase, wide letter-spacing (0.42px)
- **Animations**: Framer Motion with smooth scrolling (Lenis)
- **Layout**: Full-screen sections with backdrop blur effects

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage with collection grid
│   ├── music/page.tsx     # Music collection
│   ├── videos/page.tsx    # Videos collection
│   ├── photos/page.tsx    # Photos collection
│   ├── interviews/page.tsx
│   └── misc/page.tsx
├── components/
│   └── layout/
│       └── SmoothScrollProvider.tsx
├── styles/
│   └── globals.css        # Global styles + custom properties
└── lib/                   # Utilities and helpers (coming soon)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (custom dark theme)
- **Animations**: Framer Motion
- **Smooth Scroll**: Lenis
- **Deployment**: GitHub Pages (static export)

## 📝 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production (static export)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run generate-manifest` - Generate FrogeHost file manifest (coming soon)

## 🎯 Roadmap

- [x] Next.js setup with dark brutalist design
- [x] Smooth scrolling and basic animations
- [x] GitHub Pages deployment
- [ ] FrogeHost manifest generation
- [ ] Media grid components
- [ ] Advanced Framer Motion animations
- [ ] Audio/Video/Image viewers
- [ ] Search functionality
- [ ] Performance optimizations

## 📄 License

Unofficial fan-maintained archive. All materials are property of their respective copyright holders.

Made with 💜 by the community.
