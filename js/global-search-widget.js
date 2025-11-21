// Global search widget that can be added to any page
(function() {
    'use strict';

    let searchDatabase = null;
    let searchCache = new Map();

    // Load database (only once)
    async function loadSearchDatabase() {
        if (searchDatabase) return searchDatabase;

        try {
            const response = await fetch('/search-db.json');
            searchDatabase = await response.json();
            console.log('Search database loaded:', searchDatabase.files.length, 'files');
            return searchDatabase;
        } catch (error) {
            console.error('Failed to load search database:', error);
            return null;
        }
    }

    // Quick search function
    async function quickSearch(query, limit = 5) {
        // Check cache
        const cacheKey = `${query}-${limit}`;
        if (searchCache.has(cacheKey)) {
            return searchCache.get(cacheKey);
        }

        if (!searchDatabase) {
            await loadSearchDatabase();
        }

        if (!searchDatabase) return [];

        const terms = query.toLowerCase().split(' ').filter(t => t.length > 0);

        const results = searchDatabase.files
            .filter(file => {
                const searchText = `${file.name} ${file.path}`.toLowerCase();
                return terms.every(term => searchText.includes(term));
            })
            .slice(0, limit);

        // Cache results
        searchCache.set(cacheKey, results);

        return results;
    }

    // Create search widget HTML
    function createSearchWidget() {
        const widget = document.createElement('div');
        widget.id = 'global-search-widget';
        widget.innerHTML = `
            <style>
                #global-search-widget {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    width: 400px;
                    z-index: 999;
                }
                #global-search-input {
                    width: 100%;
                    padding: 12px 40px 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                #global-search-input:focus {
                    outline: none;
                    border-color: #9333ea;
                    box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
                }
                #global-search-results {
                    margin-top: 8px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    max-height: 400px;
                    overflow-y: auto;
                    display: none;
                }
                #global-search-results.active {
                    display: block;
                }
                .search-result-item {
                    padding: 12px;
                    border-bottom: 1px solid #f3f4f6;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                .search-result-item:hover {
                    background: #f9fafb;
                }
                .search-result-item:last-child {
                    border-bottom: none;
                }
                .search-result-name {
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 4px;
                }
                .search-result-path {
                    font-size: 12px;
                    color: #6b7280;
                }
                .search-icon {
                    position: absolute;
                    right: 32px;
                    top: 92px;
                    pointer-events: none;
                }
            </style>

            <div style="position: relative;">
                <input
                    type="text"
                    id="global-search-input"
                    placeholder="Search archive (Ctrl+K)..."
                >
                <svg class="search-icon w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
            </div>

            <div id="global-search-results"></div>
        `;

        return widget;
    }

    // Handle search input
    let debounceTimer;
    async function handleSearchInput(e) {
        const query = e.target.value.trim();
        const resultsContainer = document.getElementById('global-search-results');

        if (!query) {
            resultsContainer.classList.remove('active');
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const results = await quickSearch(query, 5);
            displayQuickResults(results, query);
        }, 300);
    }

    function displayQuickResults(results, query) {
        const container = document.getElementById('global-search-results');

        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-name">No results found</div>
                    <div class="search-result-path">Try different keywords</div>
                </div>
            `;
            container.classList.add('active');
            return;
        }

        container.innerHTML = results.map(file => `
            <a href="${file.webViewLink}" target="_blank" class="search-result-item block">
                <div class="search-result-name">${file.name}</div>
                <div class="search-result-path">${file.path}</div>
            </a>
        `).join('') + `
            <a href="/search.html?q=${encodeURIComponent(query)}" class="search-result-item block text-center" style="color: #9333ea; font-weight: 600;">
                See all results →
            </a>
        `;

        container.classList.add('active');
    }

    // Initialize widget
    function initWidget() {
        const widget = createSearchWidget();
        document.body.appendChild(widget);

        const input = document.getElementById('global-search-input');
        input.addEventListener('input', handleSearchInput);

        // Keyboard shortcut (Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                input.focus();
            }

            // Escape to close
            if (e.key === 'Escape') {
                input.blur();
                document.getElementById('global-search-results').classList.remove('active');
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!widget.contains(e.target)) {
                document.getElementById('global-search-results').classList.remove('active');
            }
        });

        // Preload database
        loadSearchDatabase();
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();
