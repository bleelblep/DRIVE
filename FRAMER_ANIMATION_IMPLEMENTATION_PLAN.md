# Framer Motion Animation Implementation Plan
## The Drive - SOPHIE Archive Redesign

---

## 🎯 Project Vision

Transform The Drive from a static HTML site into a **fluid, highly animated experience** that celebrates SOPHIE's artistic vision through motion design. Drawing inspiration from:

- **Fluidity & Motion** (Elle Fanning spotlight): Scroll-triggered parallax, layered animations, narrative pacing
- **Aesthetics** (msmsmsm.com): Dark brutalist minimalism with full-screen imagery, bold uppercase typography, high contrast
- **Technical Excellence**: React + Framer Motion for production-grade animations

### Design Philosophy
**Dark, Moody, Editorial**: Combine the atmospheric brutalism of msmsmsm.com (black backgrounds, white text, full-screen images) with fluid scroll-based animations to create an immersive, high-fashion archive experience.

---

## 📋 Table of Contents

1. [Visual Design System](#1-visual-design-system)
2. [Architecture Migration](#2-architecture-migration)
3. [Storage System Redesign](#3-storage-system-redesign)
4. [Animation Philosophy](#4-animation-philosophy)
5. [Component-by-Component Animation Plan](#5-component-by-component-animation-plan)
6. [File Viewer Redesign](#6-file-viewer-redesign)
7. [Performance Optimization](#7-performance-optimization)
8. [Implementation Phases](#8-implementation-phases)

---

## 1. Visual Design System
### Inspired by msmsmsm.com

#### Color Palette
```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Primary palette (dark brutalism)
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
      }
    }
  }
}
```

#### Typography System
```typescript
// styles/globals.css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&display=swap');

:root {
  /* Base font - using Inter Bold as Arial alternative */
  --font-primary: 'Inter', 'Arial', sans-serif;

  /* Typography scale */
  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;    /* msmsmsm.com base size */
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 48px;

  /* Letter spacing (from msmsmsm.com) */
  --tracking-wide: 0.42px;
  --tracking-wider: 1px;
  --tracking-widest: 2px;

  /* Line heights */
  --leading-tight: 1.2;
  --leading-loose: 75px;  /* msmsmsm.com dramatic spacing */
}

/* Base text styling */
body {
  font-family: var(--font-primary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--archive-white);
  background-color: var(--archive-black);
}

.text-dramatic {
  line-height: var(--leading-loose);
  letter-spacing: var(--tracking-wide);
}
```

#### Layout Principles

**Full-Screen Sections**
```typescript
// Each collection/section takes full viewport
.section-fullscreen {
  min-height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

// Background images with overlays
.section-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover;
}

// Content centered over images
.section-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
}
```

#### Component Styling

**Minimal Cards (when needed)**
```css
/* Replace colorful gradient cards with dark, borderless blocks */
.card-minimal {
  background: rgba(26, 26, 26, 0.8);  /* archive-charcoal with opacity */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  border-radius: 0;  /* No rounded corners */
}

.card-minimal:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(26, 26, 26, 0.95);
}
```

**Navigation**
```css
/* Invisible until hover, minimal when visible */
.nav-minimal {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  font-size: var(--text-sm);
  letter-spacing: var(--tracking-wider);
  opacity: 0.5;
  transition: opacity 0.3s;
}

.nav-minimal:hover {
  opacity: 1;
}
```

#### Design Tokens
```typescript
// lib/design/tokens.ts
export const designTokens = {
  // Spacing (minimal, tight)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '32px',
    xl: '64px',
    '2xl': '128px',
  },

  // Animations
  transitions: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    dramatic: '1000ms',
  },

  // Z-index layers
  zIndex: {
    background: -1,
    content: 0,
    overlay: 10,
    modal: 100,
    nav: 1000,
  },

  // Blur effects
  blur: {
    sm: 'blur(8px)',
    md: 'blur(20px)',
    lg: 'blur(40px)',
  },

  // Opacity levels
  opacity: {
    invisible: 0,
    subtle: 0.5,
    visible: 0.8,
    opaque: 1,
  }
};
```

#### Before & After Comparison

**Current Design (Light & Colorful)**
- Gradient backgrounds (gray-50 → blue-50)
- Colorful cards (violet-500 → cyan-500)
- Rounded corners (rounded-2xl)
- Drop shadows (shadow-lg)
- Traditional card-based layout

**New Design (Dark Brutalism)**
- Solid black background (#0D0D0D)
- Full-screen image treatments
- No rounded corners (sharp edges)
- Minimal borders (1px white at 10% opacity)
- Content floats over imagery
- High contrast white text
- Uppercase, bold, wide-spaced typography
- Minimal UI chrome

#### Homepage Redesign Concept

**Hero Section** (Full viewport)
```typescript
// Replaces the current logo/banner section
<motion.section className="min-h-screen relative">
  {/* Animated background image */}
  <motion.img
    src="/images/hero-sophie.jpg"
    className="fixed inset-0 w-full h-full object-cover -z-10"
    initial={{ scale: 1.1, opacity: 0 }}
    animate={{ scale: 1, opacity: 0.4 }}
    transition={{ duration: 2 }}
  />

  {/* Centered text */}
  <div className="absolute inset-0 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="text-center"
    >
      <h1 className="text-sm tracking-wide leading-loose uppercase">
        MUSIC PRODUCER<br />
        A COMPREHENSIVE ARCHIVE PRESERVING<br />
        THE ARTISTRY AND CREATIVE VISION OF SOPHIE
      </h1>
    </motion.div>
  </div>

  {/* Scroll indicator */}
  <motion.div
    className="absolute bottom-8 left-1/2 -translate-x-1/2"
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 2 }}
  >
    <span className="text-xs opacity-50">SCROLL</span>
  </motion.div>
</motion.section>
```

**Collections Section** (Full viewport, horizontal scroll)
```typescript
// Instead of grid cards, full-screen sections you scroll through
<div className="collections-container">
  <motion.section className="min-h-screen snap-start">
    <img src="/images/music-bg.jpg" className="fixed inset-0 -z-10" />
    <div className="flex items-center justify-center min-h-screen">
      <Link href="/music">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center cursor-pointer"
        >
          <h2 className="text-4xl mb-4">MUSIC</h2>
          <p className="text-sm opacity-50">
            DEMOS, COLLABORATIONS, UNRELEASED TRACKS
          </p>
          <span className="text-xs mt-8 block">→ EXPLORE</span>
        </motion.div>
      </Link>
    </div>
  </motion.section>

  {/* Repeat for each collection */}
</div>
```

---

## 2. Architecture Migration

### Current State
- **Stack**: Static HTML + Tailwind CSS + Vanilla JS
- **Storage**: Google Drive API
- **Transitions**: Basic CSS View Transitions API

### Target State
- **Stack**: Next.js 14 (App Router) + React 18 + Framer Motion + Tailwind CSS
- **Storage**: Custom storage server (details needed from user)
- **Animations**: Framer Motion with scroll-triggered, gesture-based, and layout animations

### Migration Steps

#### Phase 1.1: Next.js Setup
```bash
# Initialize Next.js with TypeScript
npx create-next-app@latest drive-animated --typescript --tailwind --app --src-dir

# Install Framer Motion and dependencies
npm install framer-motion
npm install @react-spring/parallax # For parallax effects
npm install lenis # For smooth scrolling
npm install clsx tailwind-merge # Utility helpers
```

#### Phase 1.2: Project Structure
```
src/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Homepage (collections grid)
│   ├── music/
│   │   └── page.tsx              # Music collection
│   ├── videos/
│   │   └── page.tsx              # Videos collection
│   ├── photos/
│   │   └── page.tsx              # Photos collection
│   ├── interviews/
│   │   └── page.tsx              # Interviews collection
│   ├── misc/
│   │   └── page.tsx              # Misc collection
│   └── about/
│       └── page.tsx              # About page
├── components/
│   ├── animations/
│   │   ├── ScrollReveal.tsx      # Scroll-triggered reveals
│   │   ├── ParallaxSection.tsx   # Parallax containers
│   │   ├── MagneticButton.tsx    # Magnetic hover effects
│   │   ├── TextReveal.tsx        # Character/word animations
│   │   └── PageTransition.tsx    # Route transition wrapper
│   ├── collection/
│   │   ├── CollectionCard.tsx    # Animated collection cards
│   │   ├── CollectionGrid.tsx    # Grid with stagger animations
│   │   └── CollectionHeader.tsx  # Animated headers
│   ├── media/
│   │   ├── MediaGrid.tsx         # File grid with animations
│   │   ├── MediaViewer.tsx       # Modal viewer (redesigned)
│   │   ├── AudioPlayer.tsx       # Custom audio player
│   │   ├── VideoPlayer.tsx       # Custom video player
│   │   └── ImageViewer.tsx       # Image lightbox
│   ├── ui/
│   │   ├── DarkModeToggle.tsx    # Animated toggle
│   │   ├── Breadcrumb.tsx        # Animated breadcrumbs
│   │   └── LoadingSpinner.tsx    # Animated loaders
│   └── layout/
│       ├── Navigation.tsx         # Animated navigation
│       └── Footer.tsx            # Footer animations
├── lib/
│   ├── storage/
│   │   ├── storage-client.ts     # New storage API client
│   │   └── types.ts              # TypeScript types
│   ├── animations/
│   │   ├── variants.ts           # Reusable animation variants
│   │   ├── transitions.ts        # Custom transitions
│   │   └── scroll.ts             # Scroll animation helpers
│   └── hooks/
│       ├── useScrollProgress.ts  # Track scroll position
│       ├── useInView.ts          # Intersection observer
│       └── useMediaQuery.ts      # Responsive helpers
└── styles/
    └── globals.css               # Global styles + Tailwind
```

---

## 2. Storage System Redesign

### Current Implementation
- Files hosted on Google Drive
- Real-time API queries for file listings
- Direct download links via Drive API

### New Storage Architecture

#### 2.1 Storage Server Requirements
**Question for User**: Which storage solution are you migrating to?
- Self-hosted (S3-compatible, MinIO, etc.)
- CDN (Cloudflare R2, Backblaze B2)
- Traditional VPS with file serving

#### 2.2 API Design
```typescript
// lib/storage/types.ts
export interface MediaFile {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image' | 'document';
  collection: 'music' | 'videos' | 'photos' | 'interviews' | 'misc';
  url: string;              // Direct file URL
  thumbnailUrl?: string;    // For videos/images
  metadata: {
    size: number;
    duration?: number;      // For audio/video
    dimensions?: {          // For images/video
      width: number;
      height: number;
    };
    createdAt: string;
    modifiedAt: string;
  };
  tags?: string[];
  description?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  totalSize: number;
  files: MediaFile[];
}
```

#### 2.3 Data Loading Strategy
```typescript
// Server Components for initial data loading (SSR)
// Client Components for interactive features + animations

// Example: app/music/page.tsx
export default async function MusicPage() {
  // Fetch data server-side
  const collection = await getCollection('music');

  return <MusicCollection initialData={collection} />;
}
```

---

## 3. Animation Philosophy

### Core Principles

#### 3.1 Scroll-Driven Narrative
**Inspired by**: Elle Fanning spotlight site
- Use scroll position to drive animations
- Create depth through parallax layers
- Reveal content progressively as user scrolls

#### 3.2 Fluid Motion
- All interactions should feel smooth and organic
- Use spring-based animations (not linear)
- Animations should enhance, not distract

#### 3.3 Performance First
- Use `will-change` sparingly
- Leverage GPU acceleration (transforms, opacity)
- Lazy load animations below the fold
- Reduce motion for accessibility

### Animation Timing Strategy

```typescript
// lib/animations/transitions.ts
export const transitions = {
  // Snappy for UI elements
  quick: {
    type: "spring",
    stiffness: 400,
    damping: 30
  },

  // Smooth for page transitions
  smooth: {
    type: "spring",
    stiffness: 100,
    damping: 20
  },

  // Elastic for playful elements
  bouncy: {
    type: "spring",
    stiffness: 200,
    damping: 15
  },

  // Slow for dramatic reveals
  dramatic: {
    type: "spring",
    stiffness: 50,
    damping: 20
  }
};

export const easing = {
  smooth: [0.4, 0.0, 0.2, 1],      // Material easing
  dramatic: [0.16, 1, 0.3, 1],     // Emphasized easing
  snappy: [0.87, 0, 0.13, 1],      // Sharp easing
};
```

---

## 4. Component-by-Component Animation Plan

### 4.1 Homepage (Collection Grid)

#### Hero Section
```typescript
// components/layout/Hero.tsx
import { motion, useScroll, useTransform } from 'framer-motion';

export function Hero() {
  const { scrollYProgress } = useScroll();

  // Parallax effect on hero
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section
      style={{ y, opacity }}
      className="hero-section"
    >
      {/* Animated logo */}
      <motion.img
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        src="/images/logo.png"
      />

      {/* Text reveal with character animation */}
      <TextReveal text="A comprehensive archive..." />
    </motion.section>
  );
}
```

#### Collection Cards Grid
```typescript
// components/collection/CollectionGrid.tsx
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      delay: i * 0.1, // Stagger effect
    }
  }),
  hover: {
    y: -10,
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

export function CollectionCard({ collection, index }) {
  return (
    <motion.a
      href={`/${collection.slug}`}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="gradient-bg"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Icon with magnetic effect */}
      <MagneticIcon icon={collection.icon} />

      {/* Content */}
      <div className="content">
        <h3>{collection.name}</h3>
        <p>{collection.description}</p>
      </div>
    </motion.a>
  );
}
```

### 4.2 Collection Pages (Music, Videos, etc.)

#### Page Transition
```typescript
// components/animations/PageTransition.tsx
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
}
```

#### Breadcrumb Navigation
```typescript
// components/ui/Breadcrumb.tsx
const breadcrumbItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 300
    }
  })
};

export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          custom={i}
          variants={breadcrumbItemVariants}
          initial="hidden"
          animate="visible"
        >
          {item.name}
        </motion.div>
      ))}
    </nav>
  );
}
```

#### Media Grid with Masonry Layout
```typescript
// components/media/MediaGrid.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function MediaGrid({ files }) {
  const [filter, setFilter] = useState('all');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="media-grid"
    >
      <AnimatePresence mode="popLayout">
        {files
          .filter(f => filter === 'all' || f.type === filter)
          .map((file) => (
            <motion.div
              key={file.id}
              layoutId={file.id}
              variants={itemVariants}
              exit="exit"
              whileHover={{
                scale: 1.05,
                zIndex: 10,
                transition: { duration: 0.2 }
              }}
            >
              <MediaCard file={file} />
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  );
}
```

### 4.3 Scroll-Triggered Animations

#### Parallax Sections
```typescript
// components/animations/ParallaxSection.tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ParallaxSection({ children, speed = 0.5 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
```

#### Scroll Progress Indicator
```typescript
// components/ui/ScrollProgress.tsx
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-500 z-50"
      style={{
        scaleX: scrollYProgress,
        transformOrigin: "0%"
      }}
    />
  );
}
```

#### Scroll-Reveal Text
```typescript
// components/animations/TextReveal.tsx
export function TextReveal({ text }: { text: string }) {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -90
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  return (
    <motion.p
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-reveal"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}
```

### 4.4 Interactive Elements

#### Magnetic Buttons/Icons
```typescript
// components/animations/MagneticButton.tsx
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function MagneticButton({ children }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();

    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;

    setPosition({ x, y });
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={resetPosition}
      animate={position}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
    >
      {children}
    </motion.div>
  );
}
```

#### Dark Mode Toggle (Animated)
```typescript
// components/ui/DarkModeToggle.tsx
export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  return (
    <motion.button
      onClick={() => setIsDark(!isDark)}
      className="dark-mode-toggle"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Moon icon */}
      </motion.div>
      <motion.div
        animate={{
          rotate: isDark ? 180 : 0,
          scale: isDark ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Sun icon */}
      </motion.div>
    </motion.button>
  );
}
```

---

## 5. File Viewer Redesign

### 5.1 Enhanced Media Modal

#### Audio Player
```typescript
// components/media/AudioPlayer.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function AudioPlayer({ file }: { file: MediaFile }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="audio-player"
    >
      {/* Waveform visualization */}
      <motion.div className="waveform">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="bar"
            animate={{
              scaleY: isPlaying ? [1, 2, 1] : 1
            }}
            transition={{
              duration: 0.5,
              repeat: isPlaying ? Infinity : 0,
              delay: i * 0.02
            }}
          />
        ))}
      </motion.div>

      {/* Play/Pause button */}
      <motion.button
        onClick={() => setIsPlaying(!isPlaying)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="pause"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
            >
              {/* Pause icon */}
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
            >
              {/* Play icon */}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Progress bar */}
      <motion.div className="progress-bar">
        <motion.div
          className="progress-fill"
          style={{ scaleX: progress / 100 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
      </motion.div>
    </motion.div>
  );
}
```

#### Video Player
```typescript
// components/media/VideoPlayer.tsx
export function VideoPlayer({ file }: { file: MediaFile }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className="video-player"
    >
      <video src={file.url} />

      {/* Animated controls */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="controls"
          >
            {/* Play, volume, fullscreen controls */}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

#### Image Viewer with Zoom
```typescript
// components/media/ImageViewer.tsx
export function ImageViewer({ file }: { file: MediaFile }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      className="image-viewer"
      drag={scale > 1}
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.1}
    >
      <motion.img
        src={file.url}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale }}
        transition={{ type: "spring", stiffness: 200 }}
        onDoubleClick={() => setScale(scale === 1 ? 2 : 1)}
      />

      {/* Zoom controls */}
      <div className="zoom-controls">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setScale(Math.min(scale + 0.5, 3))}
        >
          +
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setScale(Math.max(scale - 0.5, 1))}
        >
          −
        </motion.button>
      </div>
    </motion.div>
  );
}
```

### 5.2 Modal Transitions
```typescript
// components/media/MediaModal.tsx
export function MediaModal({ file, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            ×
          </motion.button>

          {/* Render appropriate viewer */}
          {file.type === 'audio' && <AudioPlayer file={file} />}
          {file.type === 'video' && <VideoPlayer file={file} />}
          {file.type === 'image' && <ImageViewer file={file} />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 6. Performance Optimization

### 6.1 Animation Performance
```typescript
// Use transform and opacity (GPU-accelerated)
// ✅ Good
<motion.div animate={{ x: 100, opacity: 0.5 }} />

// ❌ Avoid
<motion.div animate={{ left: 100, visibility: 'hidden' }} />

// Reduce motion preference
// lib/hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return reducedMotion;
}
```

### 6.2 Lazy Loading Animations
```typescript
// Only animate when in viewport
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={fadeInVariants}
/>
```

### 6.3 Layout Animations
```typescript
// Use layoutId for shared element transitions
<motion.div layoutId="unique-id">
  {/* Content */}
</motion.div>
```

### 6.4 Smooth Scrolling
```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up Next.js architecture and basic routing

- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Set up Tailwind CSS configuration
- [ ] Install Framer Motion and dependencies
- [ ] Create basic page structure (routes)
- [ ] Implement dark mode with context
- [ ] Set up global animation providers
- [ ] Migrate CSS variables and theme tokens

**Deliverable**: Static Next.js site with routing and dark mode

---

### Phase 2: Storage Migration (Week 2-3)
**Goal**: Replace Google Drive with new storage solution

- [ ] **User Input Required**: Define new storage backend
- [ ] Create storage API client (`lib/storage/storage-client.ts`)
- [ ] Design data structure for media files
- [ ] Implement file listing endpoints
- [ ] Implement file serving/CDN setup
- [ ] Create data migration scripts
- [ ] Update all file references
- [ ] Test file loading and streaming

**Deliverable**: Functional storage system with file access

---

### Phase 3: Core Animations (Week 3-4)
**Goal**: Implement primary animation system

- [ ] Page transition wrapper with route animations
- [ ] Scroll progress indicator
- [ ] Smooth scrolling with Lenis
- [ ] Collection card grid with stagger animations
- [ ] Hero section parallax
- [ ] Text reveal animations
- [ ] Breadcrumb animations
- [ ] Loading states and skeletons

**Deliverable**: Animated homepage and navigation

---

### Phase 4: Collection Pages (Week 4-5)
**Goal**: Build animated collection pages

- [ ] Media grid with layout animations
- [ ] Filter animations (AnimatePresence)
- [ ] Sort/view toggle transitions
- [ ] Infinite scroll with animated loading
- [ ] Folder navigation animations
- [ ] Search bar with animated results
- [ ] Stats counter animations

**Deliverable**: Fully animated collection browsing

---

### Phase 5: Media Viewers (Week 5-6)
**Goal**: Redesign file viewers with advanced animations

- [ ] Modal system with backdrop blur
- [ ] Audio player with waveform visualization
- [ ] Video player with animated controls
- [ ] Image viewer with zoom and pan
- [ ] Document viewer (PDFs, etc.)
- [ ] Download progress animations
- [ ] Share/copy link animations
- [ ] Keyboard navigation

**Deliverable**: Professional media viewing experience

---

### Phase 6: Advanced Interactions (Week 6-7)
**Goal**: Add sophisticated micro-interactions

- [ ] Magnetic buttons and icons
- [ ] Cursor follow effects
- [ ] Hover state animations
- [ ] Drag-to-reorder (if applicable)
- [ ] Gesture support for mobile
- [ ] 3D card tilt effects (subtle)
- [ ] Ambient animations (floating elements)
- [ ] Scroll-triggered reveals

**Deliverable**: Highly interactive, fluid interface

---

### Phase 7: Optimization & Polish (Week 7-8)
**Goal**: Performance tuning and refinements

- [ ] Audit animation performance
- [ ] Implement code splitting
- [ ] Optimize images and media
- [ ] Add loading skeletons
- [ ] Test on various devices/browsers
- [ ] Implement error boundaries
- [ ] Add accessibility features
- [ ] Reduce motion preferences
- [ ] SEO optimization
- [ ] Analytics integration

**Deliverable**: Production-ready animated site

---

### Phase 8: Testing & Deployment (Week 8)
**Goal**: Launch the new site

- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Accessibility audit (WCAG 2.1)
- [ ] Performance testing (Lighthouse)
- [ ] User testing
- [ ] Bug fixes
- [ ] Deploy to production
- [ ] Monitor performance

**Deliverable**: Live, animated archive

---

## 8. Technical Considerations

### 8.1 Browser Support
- **Primary**: Chrome/Edge 120+, Safari 17+, Firefox 120+
- **Graceful Degradation**: Older browsers get reduced animations
- **Mobile**: iOS 16+, Android Chrome 120+

### 8.2 Accessibility
```typescript
// Respect prefers-reduced-motion
const shouldAnimate = !useReducedMotion();

<motion.div
  animate={shouldAnimate ? { x: 100 } : {}}
  transition={{ duration: shouldAnimate ? 0.3 : 0 }}
/>
```

### 8.3 Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Frame Rate**: Consistent 60fps for all animations

---

## 9. Animation Library

### Reusable Variants
```typescript
// lib/animations/variants.ts
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200 }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};
```

---

## 10. Questions for User

Before starting implementation, please provide:

1. **Storage Solution**:
   - What is your new storage backend? (S3, Cloudflare R2, self-hosted, etc.)
   - Do you have API endpoints already, or do we need to design them?
   - What's the file URL structure?

2. **Design Preferences**:
   - Since I couldn't access the msmsmsm.com archive, can you describe the aesthetics you want?
   - Any specific color palette changes?
   - Typography preferences?

3. **Feature Priorities**:
   - Which animations are most important to you?
   - Any features from the current site to keep/remove?
   - Target launch date?

4. **Technical Constraints**:
   - Hosting platform? (Vercel, Netlify, custom server)
   - Budget for third-party services?
   - Domain setup?

---

## 11. Next Steps

Once you approve this plan:

1. **Provide storage backend details** → I'll create the API client
2. **Confirm aesthetic direction** → I'll refine design tokens
3. **Approve timeline** → I'll begin Phase 1 implementation

This plan transforms The Drive into a world-class, animated archive that honors SOPHIE's innovative spirit through motion design.

---

**Created**: November 2025
**Status**: Awaiting Approval
**Estimated Timeline**: 8 weeks
**Tech Stack**: Next.js 14 + React 18 + Framer Motion + TypeScript + Tailwind CSS
