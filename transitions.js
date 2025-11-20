/**
 * Smooth Page Transitions for The Drive
 * Based on the View Transitions API with fallback support
 */

class PageTransitions {
    constructor() {
        this.transitioning = false;
        this.init();
    }

    init() {
        // Intercept all internal link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');

            // Skip if not a link, external, or special target
            if (!link ||
                link.target === '_blank' ||
                link.href.startsWith('javascript:') ||
                link.hostname !== window.location.hostname) {
                return;
            }

            // Skip if already transitioning
            if (this.transitioning) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            this.navigate(link.href);
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (!this.transitioning) {
                this.navigate(window.location.href, false);
            }
        });
    }

    async navigate(url, updateHistory = true) {
        if (this.transitioning) return;
        this.transitioning = true;

        try {
            // Check if View Transitions API is supported
            if (document.startViewTransition) {
                await this.transitionWithAPI(url, updateHistory);
            } else {
                await this.transitionFallback(url, updateHistory);
            }
        } catch (error) {
            console.error('Transition error:', error);
            // Fallback to normal navigation
            window.location.href = url;
        } finally {
            this.transitioning = false;
        }
    }

    async transitionWithAPI(url, updateHistory) {
        // Fetch the new page
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch page');

        const html = await response.text();
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');

        // Start the view transition
        const transition = document.startViewTransition(() => {
            // Update the page content
            document.title = newDoc.title;
            document.body.innerHTML = newDoc.body.innerHTML;

            // Update history
            if (updateHistory) {
                window.history.pushState({}, '', url);
            }

            // Re-initialize any scripts that need to run
            this.reinitScripts();
        });

        await transition.finished;
    }

    async transitionFallback(url, updateHistory) {
        // Fade out current page
        document.body.style.transition = 'opacity 300ms ease-out';
        document.body.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 300));

        // Fetch new content
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch page');

        const html = await response.text();
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');

        // Update page
        document.title = newDoc.title;
        document.body.innerHTML = newDoc.body.innerHTML;

        if (updateHistory) {
            window.history.pushState({}, '', url);
        }

        // Re-initialize scripts
        this.reinitScripts();

        // Fade in new page
        document.body.style.opacity = '0';
        requestAnimationFrame(() => {
            document.body.style.transition = 'opacity 300ms ease-in';
            document.body.style.opacity = '1';
        });

        await new Promise(resolve => setTimeout(resolve, 300));
        document.body.style.transition = '';
    }

    reinitScripts() {
        // Re-run dark mode initialization
        if (window.initDarkMode) {
            window.initDarkMode();
        }

        // Re-run statistics loading for index page
        if (window.loadStatistics) {
            window.loadStatistics();
        }

        // Re-initialize the page transitions listener
        this.init();
    }
}

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Only initialize transitions if user hasn't requested reduced motion
if (!prefersReducedMotion.matches) {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new PageTransitions();
        });
    } else {
        new PageTransitions();
    }
} else {
    // For users who prefer reduced motion, just use default browser navigation
    console.log('Smooth transitions disabled due to user preference');
}
