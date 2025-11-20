/**
 * Smooth Page Transitions - Demo Implementation
 * Based on SMOOTH_PAGE_TRANSITIONS_GUIDE.md
 */

class PageTransitions {
  constructor() {
    this.isTransitioning = false;
    this.supportsViewTransitions = 'startViewTransition' in document;
    this.init();
  }

  init() {
    // Intercept all internal link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');

      // Skip if not a link, external, or has target="_blank"
      if (!link || link.target === '_blank' || !this.isInternalLink(link)) {
        return;
      }

      // Skip if same page
      if (link.href === window.location.href) {
        return;
      }

      e.preventDefault();
      this.navigateTo(link.href);
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      this.navigateTo(window.location.href, false);
    });

    // Add transition names to elements
    this.addTransitionNames();
  }

  isInternalLink(link) {
    return link.hostname === window.location.hostname;
  }

  addTransitionNames() {
    // Add unique transition names to key elements
    const logo = document.querySelector('img[alt="The Drive"]');
    if (logo) {
      logo.style.viewTransitionName = 'logo';
    }

    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.style.viewTransitionName = 'dark-mode-toggle';
    }

    // Add transition names to cards
    document.querySelectorAll('.card-hover, a[href*=".html"]').forEach((card, index) => {
      const href = card.getAttribute('href');
      if (href) {
        const pageName = href.replace('.html', '');
        card.style.viewTransitionName = `card-${pageName}`;
      }
    });
  }

  async navigateTo(url, updateHistory = true) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    try {
      // Fetch the new page
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      // Use View Transitions API if available
      if (this.supportsViewTransitions) {
        await this.transitionWithAPI(newDoc, url, updateHistory);
      } else {
        await this.transitionWithFallback(newDoc, url, updateHistory);
      }

    } catch (error) {
      console.error('Transition failed:', error);
      // Fallback to normal navigation
      window.location.href = url;
    } finally {
      this.isTransitioning = false;
    }
  }

  async transitionWithAPI(newDoc, url, updateHistory) {
    const transition = document.startViewTransition(() => {
      this.updatePage(newDoc, url, updateHistory);
    });

    await transition.finished;
  }

  async transitionWithFallback(newDoc, url, updateHistory) {
    // Simple fade transition for older browsers
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 200ms ease-out';

    await new Promise(resolve => setTimeout(resolve, 200));

    this.updatePage(newDoc, url, updateHistory);

    document.body.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, 200));

    document.body.style.transition = '';
  }

  updatePage(newDoc, url, updateHistory) {
    // Update title
    document.title = newDoc.title;

    // Update body content
    document.body.innerHTML = newDoc.body.innerHTML;

    // Update history
    if (updateHistory) {
      window.history.pushState({}, '', url);
    }

    // Re-initialize transitions for new content
    this.addTransitionNames();

    // Re-run dark mode script if it exists
    if (typeof initDarkMode === 'function') {
      initDarkMode();
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PageTransitions();
  });
} else {
  new PageTransitions();
}
