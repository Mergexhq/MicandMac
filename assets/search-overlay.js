/* ============================================
   MIC & MAC — SEARCH OVERLAY LOGIC
   Predictive results + LocalStorage persistence
   ============================================ */

"use strict";

const STORAGE_KEY = "mm_recent_searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

class SearchOverlay {
  constructor() {
    this.overlay = document.getElementById("SearchOverlay");
    this.input = document.getElementById("SearchOverlayInput");
    this.closeBtn = document.getElementById("SearchOverlayCloseInternal");
    this.recentList = document.getElementById("SearchRecentList");
    this.recentContainer = document.getElementById("SearchRecentContainer");
    this.trendingContainer = document.getElementById("SearchTrendingContainer");
    
    this.idleState = document.getElementById("SearchIdleState");
    this.typingState = document.getElementById("SearchTypingState");
    this.emptyState = document.getElementById("SearchEmptyState");
    this.resultsContainer = document.getElementById("SearchProductResults");
    this.suggestionsContainer = document.getElementById("SearchQuerySuggestions");
    this.viewAllBtn = document.getElementById("SearchViewAll");
    this.resetBtn = document.getElementById("SearchResetBtn");

    this.debounceTimer = null;
    this.currentQuery = "";

    if (this.overlay) {
      this._init();
    }
  }

  _init() {
    // Open triggers from Header
    document.querySelectorAll("#SearchToggle, #SearchToggleMobile").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Close triggers
    this.closeBtn.addEventListener("click", () => this.close());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.overlay.classList.contains("is-open")) {
        this.close();
      }
    });

    // Input logic
    this.input.addEventListener("input", (e) => {
      this._onInput(e.target.value.trim());
    });

    this.resetBtn.addEventListener("click", () => {
      this.input.value = "";
      this._onInput("");
      this.input.focus();
    });

    // Suggestion clicks (Recent)
    document.addEventListener("click", (e) => {
      const suggestionBtn = e.target.closest(".recent-search-btn, .query-suggestion-btn");
      if (suggestionBtn) {
        const query = suggestionBtn.dataset.query;
        this.input.value = query;
        this._onInput(query);
        this._performSearch(query);
      }
    });

    // Update view all link
    this.input.addEventListener("input", () => {
      this.viewAllBtn.href = `/search?type=product&q=${encodeURIComponent(this.input.value)}`;
    });
  }

  open() {
    this.overlay.classList.add("is-open");
    this.overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    
    // Reset to idle state on open
    this.input.value = "";
    this._onInput("");
    
    setTimeout(() => this.input.focus(), 100);
    
    // Trigger global overlay if it exists
    if (window.SiteOverlay) window.SiteOverlay.show();
  }

  close() {
    this.overlay.classList.remove("is-open");
    this.overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (window.SiteOverlay) window.SiteOverlay.hide();
  }

  _onInput(query) {
    this.currentQuery = query;

    if (query.length < 2) {
      this._showState("idle");
      this._renderRecent();
      return;
    }

    this._showState("typing");
    this._debounce(() => this._fetchResults(query));
  }

  _showState(state) {
    this.idleState.style.display = state === "idle" ? "block" : "none";
    this.typingState.style.display = state === "typing" ? "block" : "none";
    this.emptyState.style.display = state === "empty" ? "flex" : "none";
  }

  _debounce(callback) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(callback, DEBOUNCE_MS);
  }

  async _fetchResults(query) {
    if (query !== this.currentQuery) return;

    try {
      const response = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,query&resources[limit]=4&resources[options][unavailable_products]=last`);
      const data = await response.json();
      
      const products = data.resources.results.products || [];
      const suggestions = data.resources.results.queries || [];

      if (products.length === 0 && suggestions.length === 0) {
        document.getElementById("SearchEmptyQuery").textContent = query;
        this._showState("empty");
        return;
      }

      this._renderResults(products, suggestions, query);
    } catch (err) {
      console.error("[SearchOverlay] Fetch failed", err);
    }
  }

  _renderResults(products, suggestions, query) {
    // Render Suggestions
    this.suggestionsContainer.innerHTML = suggestions.length > 0
      ? suggestions.map(s => `<li><button type="button" class="query-suggestion-btn" data-query="${this._escapeHTML(s.text)}">${this._highlight(s.text, query)}</button></li>`).join("")
      : `<li><span class="no-suggestions">No suggestions for "${this._escapeHTML(query)}"</span></li>`;

    // Render Products
    this.resultsContainer.innerHTML = products.map(p => `
      <a href="${p.url}" class="search-product-card" onclick="SearchOverlayInstance.saveSearch('${this._escapeHTML(query)}')">
        <div class="search-product-card__media">
          ${p.image ? `<img src="${p.image}" alt="${p.title}" width="200" height="200" loading="lazy">` : '<div style="width:100%;height:100%;background:#f9f9f9;"></div>'}
        </div>
        <div class="search-product-card__info">
          <p class="search-product-card__name">${p.title}</p>
        </div>
      </a>
    `).join("");
  }

  _performSearch(query) {
    this.saveSearch(query);
    window.location.href = `/search?type=product&q=${encodeURIComponent(query)}`;
  }

  saveSearch(query) {
    if (!query) return;
    let searches = this._getRecent();
    searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
    searches.unshift(query);
    if (searches.length > MAX_RECENT) searches.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }

  _getRecent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  _renderRecent() {
    const searches = this._getRecent();
    
    if (searches.length === 0) {
      this.recentContainer.style.display = "none";
      this.trendingContainer.style.display = "block";
      return;
    }

    // If we have searches, hide trending and show previous
    this.trendingContainer.style.display = "none";
    this.recentContainer.style.display = "block";
    
    this.recentList.innerHTML = searches.map(s => `
      <li><button type="button" class="recent-search-btn" data-query="${this._escapeHTML(s)}">${this._escapeHTML(s)}</button></li>
    `).join("");
  }

  _highlight(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }

  _escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }
}

// Initialize and expose globally for inline attributes
window.SearchOverlayInstance = new SearchOverlay();
