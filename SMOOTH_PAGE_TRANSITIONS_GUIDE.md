# Smooth Page Transitions Guide

A comprehensive guide to implementing elegant, seamless page transitions where elements scale, grow, and morph into each other, inspired by motion.page.

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [The FLIP Technique](#the-flip-technique)
4. [View Transitions API](#view-transitions-api)
5. [Shared Element Transitions](#shared-element-transitions)
6. [Implementation Strategies](#implementation-strategies)
7. [Practical Examples](#practical-examples)
8. [Libraries & Tools](#libraries--tools)
9. [Best Practices](#best-practices)
10. [Performance Optimization](#performance-optimization)

---

## Introduction

Smooth page transitions create the illusion that elements on one page transform into elements on another page, providing visual continuity and improving user experience. Sites like motion.page demonstrate how elements can scale, morph, and flow between pages seamlessly.

### Key Characteristics

- **Spatial Continuity**: Elements appear to move through space from their origin to destination
- **Morphing**: Elements transform their shape, size, and properties during transition
- **Context Preservation**: Users maintain mental model of navigation through visual flow
- **Performance**: Smooth 60fps animations without jank

---

## Core Concepts

### 1. Shared Element Transitions

Shared element transitions (also called "Hero" or "Magic Move" animations) identify common elements between two states and animate their transformation.

**Key principles:**
- Identify corresponding elements across pages
- Calculate position/size differences
- Animate the transformation smoothly
- Handle entering/exiting elements separately

### 2. Animation Choreography

**Layered animations:**
- **Exiting elements**: Fade out, scale down, or move off-screen
- **Shared elements**: Morph from old position/size to new
- **Entering elements**: Fade in, scale up, or slide in

**Timing:**
- Stagger animations for depth
- Use easing functions for natural motion
- Typical duration: 300-600ms

### 3. State Management

Track:
- Element positions (getBoundingClientRect)
- Element styles (size, opacity, transform)
- Scroll position
- Page state before/after transition

---

## The FLIP Technique

FLIP (First, Last, Invert, Play) is the foundation for performant transitions.

### How FLIP Works

```
F - First:  Record initial position/state
L - Last:   Update DOM, record final position/state
I - Invert: Apply transform to make element appear in initial position
P - Play:   Remove transform, let CSS transition to final state
```

### Implementation

```javascript
// 1. FIRST - Record initial state
const first = element.getBoundingClientRect();

// 2. LAST - Make changes, record final state
element.classList.add('final-state');
const last = element.getBoundingClientRect();

// 3. INVERT - Calculate difference and apply reverse transform
const deltaX = first.left - last.left;
const deltaY = first.top - last.top;
const deltaW = first.width / last.width;
const deltaH = first.height / last.height;

element.style.transform = `
  translate(${deltaX}px, ${deltaY}px)
  scale(${deltaW}, ${deltaH})
`;
element.style.transition = 'none';

// 4. PLAY - Force reflow, then transition to final state
element.offsetHeight; // Force reflow
element.style.transform = 'none';
element.style.transition = 'transform 400ms cubic-bezier(0.4, 0.0, 0.2, 1)';
```

### Why FLIP Works

- Transforms (translate, scale) use GPU acceleration
- No layout recalculation during animation
- Smooth 60fps performance
- Works with any CSS properties

---

## View Transitions API

The modern browser API specifically designed for smooth page transitions.

### Browser Support

Currently supported in Chrome 111+, Edge 111+. Progressive enhancement required.

### Basic Usage

```javascript
// Simple transition
document.startViewTransition(() => {
  // Update the DOM
  document.body.innerHTML = newContent;
});
```

### Named Transitions

```css
/* Define which elements participate in transition */
.hero-image {
  view-transition-name: hero;
}

.title {
  view-transition-name: title;
}

/* Customize transition per element */
::view-transition-old(hero),
::view-transition-new(hero) {
  animation-duration: 600ms;
  animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

```javascript
async function transitionToNewPage(url) {
  // Fetch new content
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(html, 'text/html');

  // Prepare transition
  const transition = document.startViewTransition(() => {
    // Replace content
    document.body.innerHTML = newDoc.body.innerHTML;
  });

  await transition.finished;
}
```

### Advanced: Custom Animations

```css
/* Override default crossfade */
::view-transition-old(root) {
  animation: slide-out 400ms cubic-bezier(0.4, 0.0, 1, 1);
}

::view-transition-new(root) {
  animation: slide-in 400ms cubic-bezier(0.0, 0.0, 0.2, 1);
}

@keyframes slide-out {
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
}
```

---

## Shared Element Transitions

### Pattern 1: Manual Implementation

```javascript
class PageTransition {
  constructor() {
    this.transitioning = false;
  }

  async transition(fromElement, toPageUrl, toSelector) {
    if (this.transitioning) return;
    this.transitioning = true;

    // 1. Get initial state
    const firstRect = fromElement.getBoundingClientRect();
    const firstStyles = window.getComputedStyle(fromElement);

    // 2. Create clone for animation
    const clone = fromElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.top = `${firstRect.top}px`;
    clone.style.left = `${firstRect.left}px`;
    clone.style.width = `${firstRect.width}px`;
    clone.style.height = `${firstRect.height}px`;
    clone.style.margin = '0';
    clone.style.zIndex = '9999';
    clone.style.transition = 'all 500ms cubic-bezier(0.4, 0.0, 0.2, 1)';
    document.body.appendChild(clone);

    // 3. Load new page
    const response = await fetch(toPageUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');

    // 4. Get target element position (before it's visible)
    const tempContainer = document.createElement('div');
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.position = 'absolute';
    tempContainer.innerHTML = newDoc.body.innerHTML;
    document.body.appendChild(tempContainer);

    const toElement = tempContainer.querySelector(toSelector);
    const lastRect = toElement.getBoundingClientRect();

    // 5. Animate clone to final position
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        clone.style.top = `${lastRect.top}px`;
        clone.style.left = `${lastRect.left}px`;
        clone.style.width = `${lastRect.width}px`;
        clone.style.height = `${lastRect.height}px`;

        setTimeout(resolve, 500);
      });
    });

    // 6. Replace page content
    document.body.innerHTML = newDoc.body.innerHTML;

    // 7. Cleanup
    this.transitioning = false;
  }
}

// Usage
const transition = new PageTransition();
document.querySelector('.card').addEventListener('click', (e) => {
  transition.transition(e.currentTarget, '/detail.html', '.hero');
});
```

### Pattern 2: Data Attribute Mapping

```html
<!-- Page 1 -->
<div class="thumbnail" data-transition-id="product-123">
  <img src="thumb.jpg" alt="Product">
</div>

<!-- Page 2 -->
<div class="hero" data-transition-id="product-123">
  <img src="full.jpg" alt="Product">
</div>
```

```javascript
function findCorrespondingElement(element, newDocument) {
  const transitionId = element.getAttribute('data-transition-id');
  if (transitionId) {
    return newDocument.querySelector(`[data-transition-id="${transitionId}"]`);
  }
  return null;
}
```

---

## Implementation Strategies

### Strategy 1: Single Page Application (SPA)

Best for React, Vue, Svelte apps with client-side routing.

```javascript
// React example with Framer Motion
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}
```

### Strategy 2: Multi-Page Application (MPA)

Intercept navigation and manually handle transitions.

```javascript
// Intercept all link clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link || link.target === '_blank') return;

  e.preventDefault();
  const url = link.href;

  // Perform custom transition
  performPageTransition(url);
});

async function performPageTransition(url) {
  // 1. Identify shared elements
  const sharedElements = document.querySelectorAll('[data-shared]');
  const elementsData = Array.from(sharedElements).map(el => ({
    id: el.getAttribute('data-shared'),
    rect: el.getBoundingClientRect(),
    element: el
  }));

  // 2. Fetch new page
  const response = await fetch(url);
  const html = await response.text();

  // 3. Parse and find corresponding elements
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(html, 'text/html');

  // 4. Animate shared elements
  for (const data of elementsData) {
    const newElement = newDoc.querySelector(`[data-shared="${data.id}"]`);
    if (newElement) {
      await animateSharedElement(data.element, newElement);
    }
  }

  // 5. Update page
  document.body.innerHTML = newDoc.body.innerHTML;
  window.history.pushState({}, '', url);
}
```

### Strategy 3: Hybrid with View Transitions API

Progressive enhancement with fallback.

```javascript
async function navigateWithTransition(url) {
  // Check for View Transitions API support
  if (document.startViewTransition) {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');

    const transition = document.startViewTransition(() => {
      document.body.innerHTML = newDoc.body.innerHTML;
      window.history.pushState({}, '', url);
    });

    await transition.finished;
  } else {
    // Fallback to manual FLIP transition
    await manualFlipTransition(url);
  }
}
```

---

## Practical Examples

### Example 1: Gallery to Detail Page

```html
<!-- Gallery Page -->
<div class="gallery">
  <div class="card" data-transition-id="item-1" onclick="navigateToDetail(1)">
    <img src="thumb-1.jpg" class="card-image">
    <h3 class="card-title">Item 1</h3>
  </div>
</div>

<!-- Detail Page -->
<div class="detail">
  <img src="full-1.jpg" class="hero-image" data-transition-id="item-1">
  <h1 class="hero-title">Item 1</h1>
  <p class="description">...</p>
</div>
```

```javascript
async function navigateToDetail(id) {
  const card = document.querySelector(`[data-transition-id="item-${id}"]`);
  const cardRect = card.getBoundingClientRect();

  // Create expanding overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = `${cardRect.top}px`;
  overlay.style.left = `${cardRect.left}px`;
  overlay.style.width = `${cardRect.width}px`;
  overlay.style.height = `${cardRect.height}px`;
  overlay.style.background = 'white';
  overlay.style.borderRadius = '8px';
  overlay.style.zIndex = '9999';
  overlay.style.transition = 'all 400ms cubic-bezier(0.4, 0.0, 0.2, 1)';
  document.body.appendChild(overlay);

  // Animate to fullscreen
  requestAnimationFrame(() => {
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.borderRadius = '0';
  });

  // Load new content
  await new Promise(resolve => setTimeout(resolve, 400));

  const response = await fetch(`/detail/${id}`);
  const html = await response.text();
  const parser = new DOMParser();
  const newDoc = parser.parseFromString(html, 'text/html');

  document.body.innerHTML = newDoc.body.innerHTML;
  window.history.pushState({}, '', `/detail/${id}`);
}
```

### Example 2: Morphing Navigation

```css
/* Define shared elements */
.nav-item {
  view-transition-name: var(--transition-name);
}

.page-header {
  view-transition-name: header;
}
```

```javascript
// Set unique transition names
document.querySelectorAll('.nav-item').forEach((item, index) => {
  item.style.setProperty('--transition-name', `nav-item-${index}`);
});

// Navigate with transition
async function navigate(url) {
  const transition = document.startViewTransition(async () => {
    const response = await fetch(url);
    const html = await response.text();
    const newDoc = new DOMParser().parseFromString(html, 'text/html');

    document.body.innerHTML = newDoc.body.innerHTML;

    // Re-apply transition names
    document.querySelectorAll('.nav-item').forEach((item, index) => {
      item.style.setProperty('--transition-name', `nav-item-${index}`);
    });
  });

  await transition.finished;
}
```

### Example 3: Staggered List Animations

```javascript
function animateListTransition(oldList, newList) {
  const oldItems = Array.from(oldList.children);
  const newItems = Array.from(newList.children);

  // Animate out old items
  oldItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.transition = 'all 300ms ease-out';
      item.style.opacity = '0';
      item.style.transform = 'translateY(-20px)';
    }, i * 50);
  });

  // Wait for exit animation
  setTimeout(() => {
    // Replace content
    oldList.innerHTML = newList.innerHTML;

    // Animate in new items
    Array.from(oldList.children).forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';

      setTimeout(() => {
        item.style.transition = 'all 300ms ease-out';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, i * 50);
    });
  }, oldItems.length * 50 + 300);
}
```

---

## Libraries & Tools

### 1. **Framer Motion** (React)

Most powerful animation library for React.

```bash
npm install framer-motion
```

```jsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={page}
    initial={{ opacity: 0, x: -200 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 200 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

**Shared Layout Animations:**

```jsx
<motion.div layoutId="unique-id" />
```

### 2. **GSAP (GreenSock)**

Industry-standard animation library.

```bash
npm install gsap
```

```javascript
import gsap from 'gsap';
import Flip from 'gsap/Flip';

gsap.registerPlugin(Flip);

// Record initial state
const state = Flip.getState('.element');

// Make changes
element.classList.add('new-class');

// Animate
Flip.from(state, {
  duration: 0.5,
  ease: 'power2.inOut'
});
```

### 3. **Barba.js**

Specialized library for page transitions.

```bash
npm install @barba/core
```

```javascript
import barba from '@barba/core';

barba.init({
  transitions: [{
    name: 'default',
    leave(data) {
      return gsap.to(data.current.container, {
        opacity: 0,
        duration: 0.3
      });
    },
    enter(data) {
      return gsap.from(data.next.container, {
        opacity: 0,
        duration: 0.3
      });
    }
  }]
});
```

### 4. **Swup**

Another page transition library.

```bash
npm install swup
```

```javascript
import Swup from 'swup';

const swup = new Swup({
  containers: ['#swup'],
  animationSelector: '[class*="transition-"]'
});
```

### 5. **Highway**

Modern page transition manager.

```javascript
import Highway from '@dogstudio/highway';

const H = new Highway.Core({
  transitions: {
    default: YourTransition
  }
});
```

### 6. **Motion One**

Lightweight alternative to Framer Motion.

```bash
npm install motion
```

```javascript
import { animate, stagger } from 'motion';

animate(
  '.element',
  { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
  { duration: 0.5, easing: 'ease-out' }
);
```

---

## Best Practices

### 1. Performance

- **Use transform and opacity**: GPU-accelerated properties
- **Avoid animating layout properties**: width, height, margin, padding trigger reflow
- **Use `will-change` sparingly**: Only during animation
  ```css
  .animating {
    will-change: transform, opacity;
  }
  ```
- **Clean up**: Remove `will-change` after animation completes

### 2. Accessibility

```javascript
// Respect user preferences
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches) {
  // Perform animation
} else {
  // Instant transition
}
```

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Timing & Easing

**Common easing functions:**
- **Ease-out**: `cubic-bezier(0, 0, 0.2, 1)` - Enters quickly, settles slowly
- **Ease-in-out**: `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design standard
- **Spring**: More natural, bouncy feel
- **Custom**: Use tools like [cubic-bezier.com](https://cubic-bezier.com)

**Duration guidelines:**
- Small elements: 200-300ms
- Medium elements: 300-400ms
- Full page: 400-600ms
- Complex choreography: 600-800ms

### 4. Progressive Enhancement

```javascript
// Feature detection
const supportsViewTransitions = 'startViewTransition' in document;
const supportsWebAnimations = 'animate' in Element.prototype;

// Fallback strategy
if (supportsViewTransitions) {
  // Use View Transitions API
} else if (supportsWebAnimations) {
  // Use Web Animations API
} else {
  // Use CSS transitions/animations
}
```

### 5. Loading States

```javascript
async function transitionWithLoading(url) {
  // Show loading indicator on long transitions
  const loadingTimeout = setTimeout(() => {
    showLoadingSpinner();
  }, 300);

  try {
    await performTransition(url);
  } finally {
    clearTimeout(loadingTimeout);
    hideLoadingSpinner();
  }
}
```

### 6. Error Handling

```javascript
async function safeTransition(url) {
  try {
    await performTransition(url);
  } catch (error) {
    console.error('Transition failed:', error);
    // Fallback to normal navigation
    window.location.href = url;
  }
}
```

---

## Performance Optimization

### 1. Reduce Paint Complexity

```css
/* Good: Composited layers */
.animated {
  transform: translateZ(0); /* Force GPU layer */
  backface-visibility: hidden;
}

/* Avoid: Paint-heavy properties during animation */
.animated {
  box-shadow: ...; /* Expensive */
  border-radius: ...; /* Can be expensive */
  filter: blur(...); /* Very expensive */
}
```

### 2. Batch DOM Reads/Writes

```javascript
// Bad: Causes layout thrashing
elements.forEach(el => {
  const width = el.offsetWidth; // Read
  el.style.width = width + 10 + 'px'; // Write
});

// Good: Batch reads, then writes
const widths = elements.map(el => el.offsetWidth);
elements.forEach((el, i) => {
  el.style.width = widths[i] + 10 + 'px';
});
```

### 3. Use requestAnimationFrame

```javascript
function smoothTransition() {
  requestAnimationFrame(() => {
    // First frame: prepare
    element.classList.add('transitioning');

    requestAnimationFrame(() => {
      // Second frame: animate
      element.classList.add('active');
    });
  });
}
```

### 4. Debounce Resize Events

```javascript
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    recalculateTransitions();
  }, 150);
});
```

### 5. Virtual Scrolling for Long Lists

```javascript
// For large lists, only render visible items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

### 6. Preload Critical Resources

```html
<link rel="preload" href="/next-page" as="document">
<link rel="prefetch" href="/images/hero.jpg">
```

---

## Advanced Techniques

### 1. Shared Element with Different Aspect Ratios

```javascript
function morphWithAspectRatio(fromEl, toEl) {
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();

  // Calculate scale that maintains aspect ratio
  const scaleX = toRect.width / fromRect.width;
  const scaleY = toRect.height / fromRect.height;

  // Use object-fit to handle different aspect ratios
  fromEl.style.objectFit = 'cover';
  fromEl.animate([
    {
      transform: `translate(0, 0) scale(1)`,
      objectPosition: 'center'
    },
    {
      transform: `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px) scale(${scaleX}, ${scaleY})`,
      objectPosition: 'center'
    }
  ], {
    duration: 500,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  });
}
```

### 2. Path Morphing (SVG)

```javascript
import { animate } from 'motion';

animate(
  'path',
  { d: 'M 0,0 L 100,100 ...' }, // Target path
  { duration: 0.5, easing: 'ease-in-out' }
);
```

### 3. Scroll-Linked Transitions

```javascript
function createScrollTransition() {
  let scrollY = 0;

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;

    // Interpolate based on scroll
    const progress = Math.min(scrollY / 500, 1);

    heroElement.style.transform = `scale(${1 + progress * 0.2})`;
    heroElement.style.opacity = 1 - progress * 0.5;
  });
}
```

### 4. Physics-Based Animations

```javascript
import { spring } from 'motion';

animate(
  element,
  { x: 100 },
  {
    easing: spring({
      stiffness: 300,
      damping: 20,
      mass: 1
    })
  }
);
```

---

## Complete Example: motion.page-Style Site

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smooth Transitions Demo</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* View Transitions API */
    @supports (view-transition-name: none) {
      .card-image {
        view-transition-name: var(--transition-id);
      }

      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation-duration: 0.4s;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      padding: 2rem;
    }

    .card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .card-image {
      width: 100%;
      aspect-ratio: 16/9;
      object-fit: cover;
    }

    .card-content {
      padding: 1.5rem;
    }

    .detail-view {
      position: fixed;
      inset: 0;
      background: white;
      padding: 2rem;
      overflow-y: auto;
    }

    .detail-image {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="gallery">
      <div class="card" data-id="1" onclick="showDetail(1)">
        <img src="https://picsum.photos/600/400?random=1" class="card-image" style="--transition-id: image-1">
        <div class="card-content">
          <h2>Item 1</h2>
          <p>Click to view details</p>
        </div>
      </div>
      <div class="card" data-id="2" onclick="showDetail(2)">
        <img src="https://picsum.photos/600/400?random=2" class="card-image" style="--transition-id: image-2">
        <div class="card-content">
          <h2>Item 2</h2>
          <p>Click to view details</p>
        </div>
      </div>
      <!-- More cards... -->
    </div>
  </div>

  <script>
    async function showDetail(id) {
      const detailHTML = `
        <div class="detail-view">
          <button onclick="hideDetail(${id})">← Back</button>
          <img src="https://picsum.photos/800/600?random=${id}"
               class="detail-image"
               style="--transition-id: image-${id}">
          <h1>Item ${id}</h1>
          <p>Detailed content here...</p>
        </div>
      `;

      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          document.getElementById('app').innerHTML = detailHTML;
        });
        await transition.finished;
      } else {
        // Fallback
        document.getElementById('app').innerHTML = detailHTML;
      }
    }

    async function hideDetail(id) {
      const galleryHTML = `
        <div class="gallery">
          ${[1, 2, 3, 4].map(i => `
            <div class="card" data-id="${i}" onclick="showDetail(${i})">
              <img src="https://picsum.photos/600/400?random=${i}"
                   class="card-image"
                   style="--transition-id: image-${i}">
              <div class="card-content">
                <h2>Item ${i}</h2>
                <p>Click to view details</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      if (document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          document.getElementById('app').innerHTML = galleryHTML;
        });
        await transition.finished;
      } else {
        document.getElementById('app').innerHTML = galleryHTML;
      }
    }
  </script>
</body>
</html>
```

---

## Resources

### Documentation
- [View Transitions API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [FLIP Technique - Paul Lewis](https://aerotwist.com/blog/flip-your-animations/)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

### Tools
- [cubic-bezier.com](https://cubic-bezier.com) - Easing function generator
- [Easings.net](https://easings.net) - Easing function cheat sheet
- [GSAP](https://greensock.com/gsap/) - Professional animation library
- [Framer Motion](https://www.framer.com/motion/) - React animation library

### Examples
- [View Transitions Examples](https://glitch.com/@chrome/view-transitions)
- [Page Transitions](https://page-transitions.com)
- [Codrops Page Transitions](https://tympanus.net/Development/PageTransitions/)

---

## Conclusion

Creating smooth, elegant page transitions requires:

1. **Understanding core principles**: FLIP, shared elements, timing
2. **Choosing the right approach**: View Transitions API, manual FLIP, or libraries
3. **Optimizing performance**: Use GPU-accelerated properties, batch DOM operations
4. **Considering accessibility**: Respect prefers-reduced-motion
5. **Progressive enhancement**: Graceful degradation for unsupported browsers

Start simple with the View Transitions API for modern browsers, and progressively enhance with manual techniques for broader support. Focus on meaningful motion that guides users through your interface rather than decoration.

The key is making transitions feel natural and purposeful—each animation should communicate spatial relationships and maintain context as users navigate your site.
