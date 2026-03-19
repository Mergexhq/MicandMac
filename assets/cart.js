"use strict";
(() => {
  // src/utils/api.ts
  var HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  async function shopifyFetch(url, options) {
    const res = await fetch(url, { ...options, headers: HEADERS });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.description ?? `Request failed: ${res.status}`);
    }
    return res.json();
  }
  var CartAPI = {
    get: () => shopifyFetch("/cart.js"),
    add: (payload) => shopifyFetch("/cart/add.js", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    change: (payload) => shopifyFetch("/cart/change.js", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
    update: (updates) => shopifyFetch("/cart/update.js", {
      method: "POST",
      body: JSON.stringify({ updates })
    }),
    addNote: (note) => shopifyFetch("/cart/update.js", {
      method: "POST",
      body: JSON.stringify({ note })
    })
  };

  // src/utils/dom.ts
  var $ = (sel, ctx = document) => ctx.querySelector(sel);
  var $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // src/utils/money.ts
  function formatMoney(cents, symbol = "\u20B9") {
    const amount = cents / 100;
    return symbol + amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  // src/modules/cart.ts
  var CartDrawer = class {
    constructor() {
      this.drawer = $("#CartDrawer");
      this.overlay = $("#SiteOverlay");
      this.body = $("#CartDrawerBody");
      this.totalEl = $("#CartTotal");
      this.countEls = $$("#CartCount");
      this.emptyEl = $("#CartEmpty");
      this.filledEl = $("#CartFilled");
      this.bindEvents();
      void this.refresh();
    }
    open() {
      this.drawer?.classList.add("is-open");
      this.overlay?.classList.add("is-active");
      document.body.style.overflow = "hidden";
    }
    close() {
      this.drawer?.classList.remove("is-open");
      this.overlay?.classList.remove("is-active");
      document.body.style.overflow = "";
    }
    async addItem(variantId, quantity = 1) {
      try {
        await CartAPI.add({ id: variantId, quantity });
        await this.refresh();
        this.open();
      } catch (err) {
        console.error("Add to cart error:", err);
        this.showToast("Could not add to cart. Please try again.");
      }
    }
    async refresh() {
      const cart = await CartAPI.get();
      this.updateCount(cart.item_count);
      this.renderItems(cart);
    }
    updateCount(count) {
      this.countEls.forEach((el) => {
        el.textContent = String(count);
        el.classList.toggle("cart-count--hidden", count === 0);
        if (count > 0) {
          el.classList.add("bump");
          setTimeout(() => el.classList.remove("bump"), 400);
        }
      });
    }
    renderItems(cart) {
      const isEmpty = cart.item_count === 0;
      this.emptyEl?.classList.toggle("hidden", !isEmpty);
      this.filledEl?.classList.toggle("hidden", isEmpty);
      if (this.totalEl) {
        this.totalEl.textContent = formatMoney(cart.total_price);
      }
      if (!this.body || isEmpty) return;
      this.body.innerHTML = cart.items.map((item) => this.itemHTML(item)).join("");
      this.bindItemEvents();
    }
    itemHTML(item) {
      const imgSrc = item.featured_image?.url ?? "";
      const variantLabel = item.variant_title && item.variant_title !== "Default Title" ? `<p class="cart-item__variant">${item.variant_title}</p>` : "";
      return `
      <div class="cart-item" data-key="${item.key}">
        <a href="${item.url}" class="cart-item__image-link" tabindex="-1">
          ${imgSrc ? `<img src="${imgSrc.replace("?", "?width=150&")}" alt="${item.product_title}" width="80" height="80" loading="lazy">` : '<div class="cart-item__image-placeholder"></div>'}
        </a>
        <div class="cart-item__info">
          <a href="${item.url}" class="cart-item__title">${item.product_title}</a>
          ${variantLabel}
          <div class="cart-item__bottom">
            <div class="qty-input qty-input--sm">
              <button class="qty-input__btn" data-action="decrease" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Decrease quantity">\u2212</button>
              <span class="qty-input__value">${item.quantity}</span>
              <button class="qty-input__btn" data-action="increase" data-key="${item.key}" data-qty="${item.quantity}" aria-label="Increase quantity">+</button>
            </div>
            <p class="cart-item__price">${formatMoney(item.final_line_price)}</p>
          </div>
        </div>
        <button class="cart-item__remove" data-key="${item.key}" aria-label="Remove ${item.product_title}">\xD7</button>
      </div>`;
    }
    bindItemEvents() {
      this.body?.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.dataset.key;
          const qty = parseInt(btn.dataset.qty ?? "1", 10);
          const newQty = btn.dataset.action === "increase" ? qty + 1 : Math.max(0, qty - 1);
          void CartAPI.change({ id: key, quantity: newQty }).then(() => this.refresh());
        });
      });
      this.body?.querySelectorAll(".cart-item__remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          void CartAPI.change({ id: btn.dataset.key, quantity: 0 }).then(() => this.refresh());
        });
      });
    }
    bindEvents() {
      $("#CartToggle")?.addEventListener("click", () => this.open());
      $("#CartDrawerClose")?.addEventListener("click", () => this.close());
      this.overlay?.addEventListener("click", () => this.close());
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.close();
      });
      document.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-atc]");
        if (!btn) return;
        const variantId = Number(btn.dataset.variantId);
        if (!variantId) return;
        btn.disabled = true;
        const original = btn.textContent ?? "Add to Cart";
        btn.textContent = "Adding\u2026";
        await this.addItem(variantId);
        btn.textContent = "Added \u2713";
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 2e3);
      });
    }
    showToast(msg) {
      console.warn("[Cart]", msg);
    }
  };
  var cartDrawer = new CartDrawer();
  window.closeCartDrawer = () => cartDrawer.close();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3V0aWxzL2FwaS50cyIsICIuLi9zcmMvdXRpbHMvZG9tLnRzIiwgIi4uL3NyYy91dGlscy9tb25leS50cyIsICIuLi9zcmMvbW9kdWxlcy9jYXJ0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBzcmMvdXRpbHMvYXBpLnRzIFx1MjAxNCBTaG9waWZ5IFN0b3JlZnJvbnQgQWpheCBBUEkgd3JhcHBlcnNcblxuaW1wb3J0IHR5cGUge1xuICBTaG9waWZ5Q2FydCxcbiAgU2hvcGlmeUNhcnRJdGVtLFxuICBDYXJ0QWRkUGF5bG9hZCxcbiAgQ2FydENoYW5nZVBheWxvYWQsXG59IGZyb20gJy4uL3R5cGVzL3Nob3BpZnknO1xuXG5jb25zdCBIRUFERVJTID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHNob3BpZnlGZXRjaDxUPih1cmw6IHN0cmluZywgb3B0aW9ucz86IFJlcXVlc3RJbml0KTogUHJvbWlzZTxUPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwgeyAuLi5vcHRpb25zLCBoZWFkZXJzOiBIRUFERVJTIH0pO1xuICBpZiAoIXJlcy5vaykge1xuICAgIGNvbnN0IGVycm9yID0gYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKSBhcyB7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG4gICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLmRlc2NyaXB0aW9uID8/IGBSZXF1ZXN0IGZhaWxlZDogJHtyZXMuc3RhdHVzfWApO1xuICB9XG4gIHJldHVybiByZXMuanNvbigpIGFzIFByb21pc2U8VD47XG59XG5cbmV4cG9ydCBjb25zdCBDYXJ0QVBJID0ge1xuICBnZXQ6ICgpOiBQcm9taXNlPFNob3BpZnlDYXJ0PiA9PlxuICAgIHNob3BpZnlGZXRjaCgnL2NhcnQuanMnKSxcblxuICBhZGQ6IChwYXlsb2FkOiBDYXJ0QWRkUGF5bG9hZCk6IFByb21pc2U8U2hvcGlmeUNhcnRJdGVtPiA9PlxuICAgIHNob3BpZnlGZXRjaCgnL2NhcnQvYWRkLmpzJywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICB9KSxcblxuICBjaGFuZ2U6IChwYXlsb2FkOiBDYXJ0Q2hhbmdlUGF5bG9hZCk6IFByb21pc2U8U2hvcGlmeUNhcnQ+ID0+XG4gICAgc2hvcGlmeUZldGNoKCcvY2FydC9jaGFuZ2UuanMnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpLFxuICAgIH0pLFxuXG4gIHVwZGF0ZTogKHVwZGF0ZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4pOiBQcm9taXNlPFNob3BpZnlDYXJ0PiA9PlxuICAgIHNob3BpZnlGZXRjaCgnL2NhcnQvdXBkYXRlLmpzJywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHVwZGF0ZXMgfSksXG4gICAgfSksXG5cbiAgYWRkTm90ZTogKG5vdGU6IHN0cmluZyk6IFByb21pc2U8U2hvcGlmeUNhcnQ+ID0+XG4gICAgc2hvcGlmeUZldGNoKCcvY2FydC91cGRhdGUuanMnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgbm90ZSB9KSxcbiAgICB9KSxcbn07XG4iLCAiLy8gc3JjL3V0aWxzL2RvbS50cyBcdTIwMTQgVHlwZS1zYWZlIERPTSBoZWxwZXJzXG5cbmV4cG9ydCBjb25zdCAkID0gPFQgZXh0ZW5kcyBFbGVtZW50PihzZWw6IHN0cmluZywgY3R4OiBQYXJlbnROb2RlID0gZG9jdW1lbnQpOiBUIHwgbnVsbCA9PlxuICBjdHgucXVlcnlTZWxlY3RvcjxUPihzZWwpO1xuXG5leHBvcnQgY29uc3QgJCQgPSA8VCBleHRlbmRzIEVsZW1lbnQ+KHNlbDogc3RyaW5nLCBjdHg6IFBhcmVudE5vZGUgPSBkb2N1bWVudCk6IFRbXSA9PlxuICBbLi4uY3R4LnF1ZXJ5U2VsZWN0b3JBbGw8VD4oc2VsKV07XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZTxUIGV4dGVuZHMgKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdm9pZD4oZm46IFQsIHdhaXQgPSAyMDApIHtcbiAgbGV0IHRpbWVyOiBSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PjtcbiAgcmV0dXJuICguLi5hcmdzOiBQYXJhbWV0ZXJzPFQ+KSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gZm4oLi4uYXJncyksIHdhaXQpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb248SyBleHRlbmRzIGtleW9mIEhUTUxFbGVtZW50RXZlbnRNYXA+KFxuICBlbDogRWxlbWVudCB8IFdpbmRvdyB8IERvY3VtZW50IHwgbnVsbCxcbiAgZXZlbnQ6IEssXG4gIGhhbmRsZXI6IChlOiBIVE1MRWxlbWVudEV2ZW50TWFwW0tdKSA9PiB2b2lkLFxuICBvcHRpb25zPzogQWRkRXZlbnRMaXN0ZW5lck9wdGlvbnNcbik6IHZvaWQge1xuICBlbD8uYWRkRXZlbnRMaXN0ZW5lcihldmVudCBhcyBzdHJpbmcsIGhhbmRsZXIgYXMgRXZlbnRMaXN0ZW5lciwgb3B0aW9ucyk7XG59XG4iLCAiLy8gc3JjL3V0aWxzL21vbmV5LnRzIFx1MjAxNCBJbmRpYW4gUnVwZWUgZm9ybWF0dGluZ1xuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0TW9uZXkoY2VudHM6IG51bWJlciwgc3ltYm9sID0gJ1x1MjBCOScpOiBzdHJpbmcge1xuICBjb25zdCBhbW91bnQgPSBjZW50cyAvIDEwMDtcbiAgcmV0dXJuIHN5bWJvbCArIGFtb3VudC50b0xvY2FsZVN0cmluZygnZW4tSU4nLCB7XG4gICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAwLFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0czogMixcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRNb25leVdpdGhDdXJyZW5jeShjZW50czogbnVtYmVyLCBjdXJyZW5jeSA9ICdJTlInKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5ldyBJbnRsLk51bWJlckZvcm1hdCgnZW4tSU4nLCB7XG4gICAgc3R5bGU6ICdjdXJyZW5jeScsXG4gICAgY3VycmVuY3ksXG4gICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAwLFxuICB9KS5mb3JtYXQoY2VudHMgLyAxMDApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2F2aW5nc1BlcmNlbnQocHJpY2U6IG51bWJlciwgY29tcGFyZUF0UHJpY2U6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnJvdW5kKCgoY29tcGFyZUF0UHJpY2UgLSBwcmljZSkgLyBjb21wYXJlQXRQcmljZSkgKiAxMDApO1xufVxuIiwgIi8vIHNyYy9tb2R1bGVzL2NhcnQudHMgXHUyMDE0IENhcnREcmF3ZXIgd2l0aCBmdWxsIFR5cGVTY3JpcHRcblxuaW1wb3J0IHR5cGUgeyBTaG9waWZ5Q2FydCwgU2hvcGlmeUNhcnRJdGVtIH0gZnJvbSAnLi4vdHlwZXMvc2hvcGlmeSc7XG5pbXBvcnQgeyBDYXJ0QVBJIH0gZnJvbSAnLi4vdXRpbHMvYXBpJztcbmltcG9ydCB7ICQsICQkIH0gZnJvbSAnLi4vdXRpbHMvZG9tJztcbmltcG9ydCB7IGZvcm1hdE1vbmV5IH0gZnJvbSAnLi4vdXRpbHMvbW9uZXknO1xuXG5jbGFzcyBDYXJ0RHJhd2VyIHtcbiAgcHJpdmF0ZSBkcmF3ZXIgICA9ICQ8SFRNTEVsZW1lbnQ+KCcjQ2FydERyYXdlcicpO1xuICBwcml2YXRlIG92ZXJsYXkgID0gJDxIVE1MRWxlbWVudD4oJyNTaXRlT3ZlcmxheScpO1xuICBwcml2YXRlIGJvZHkgICAgID0gJDxIVE1MRWxlbWVudD4oJyNDYXJ0RHJhd2VyQm9keScpO1xuICBwcml2YXRlIHRvdGFsRWwgID0gJDxIVE1MRWxlbWVudD4oJyNDYXJ0VG90YWwnKTtcbiAgcHJpdmF0ZSBjb3VudEVscyA9ICQkPEhUTUxFbGVtZW50PignI0NhcnRDb3VudCcpO1xuICBwcml2YXRlIGVtcHR5RWwgID0gJDxIVE1MRWxlbWVudD4oJyNDYXJ0RW1wdHknKTtcbiAgcHJpdmF0ZSBmaWxsZWRFbCA9ICQ8SFRNTEVsZW1lbnQ+KCcjQ2FydEZpbGxlZCcpO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgIHZvaWQgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICBvcGVuKCk6IHZvaWQge1xuICAgIHRoaXMuZHJhd2VyPy5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgdGhpcy5vdmVybGF5Py5jbGFzc0xpc3QuYWRkKCdpcy1hY3RpdmUnKTtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRyYXdlcj8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpO1xuICAgIHRoaXMub3ZlcmxheT8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuICB9XG5cbiAgYXN5bmMgYWRkSXRlbSh2YXJpYW50SWQ6IG51bWJlciwgcXVhbnRpdHkgPSAxKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IENhcnRBUEkuYWRkKHsgaWQ6IHZhcmlhbnRJZCwgcXVhbnRpdHkgfSk7XG4gICAgICBhd2FpdCB0aGlzLnJlZnJlc2goKTtcbiAgICAgIHRoaXMub3BlbigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignQWRkIHRvIGNhcnQgZXJyb3I6JywgZXJyKTtcbiAgICAgIHRoaXMuc2hvd1RvYXN0KCdDb3VsZCBub3QgYWRkIHRvIGNhcnQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVmcmVzaCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjYXJ0ID0gYXdhaXQgQ2FydEFQSS5nZXQoKTtcbiAgICB0aGlzLnVwZGF0ZUNvdW50KGNhcnQuaXRlbV9jb3VudCk7XG4gICAgdGhpcy5yZW5kZXJJdGVtcyhjYXJ0KTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlQ291bnQoY291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY291bnRFbHMuZm9yRWFjaChlbCA9PiB7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IFN0cmluZyhjb3VudCk7XG4gICAgICBlbC5jbGFzc0xpc3QudG9nZ2xlKCdjYXJ0LWNvdW50LS1oaWRkZW4nLCBjb3VudCA9PT0gMCk7XG4gICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2J1bXAnKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKCdidW1wJyksIDQwMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckl0ZW1zKGNhcnQ6IFNob3BpZnlDYXJ0KTogdm9pZCB7XG4gICAgY29uc3QgaXNFbXB0eSA9IGNhcnQuaXRlbV9jb3VudCA9PT0gMDtcbiAgICB0aGlzLmVtcHR5RWw/LmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFpc0VtcHR5KTtcbiAgICB0aGlzLmZpbGxlZEVsPy5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCBpc0VtcHR5KTtcblxuICAgIGlmICh0aGlzLnRvdGFsRWwpIHtcbiAgICAgIHRoaXMudG90YWxFbC50ZXh0Q29udGVudCA9IGZvcm1hdE1vbmV5KGNhcnQudG90YWxfcHJpY2UpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuYm9keSB8fCBpc0VtcHR5KSByZXR1cm47XG5cbiAgICB0aGlzLmJvZHkuaW5uZXJIVE1MID0gY2FydC5pdGVtcy5tYXAoaXRlbSA9PiB0aGlzLml0ZW1IVE1MKGl0ZW0pKS5qb2luKCcnKTtcbiAgICB0aGlzLmJpbmRJdGVtRXZlbnRzKCk7XG4gIH1cblxuICBwcml2YXRlIGl0ZW1IVE1MKGl0ZW06IFNob3BpZnlDYXJ0SXRlbSk6IHN0cmluZyB7XG4gICAgY29uc3QgaW1nU3JjID0gaXRlbS5mZWF0dXJlZF9pbWFnZT8udXJsID8/ICcnO1xuICAgIGNvbnN0IHZhcmlhbnRMYWJlbCA9IGl0ZW0udmFyaWFudF90aXRsZSAmJiBpdGVtLnZhcmlhbnRfdGl0bGUgIT09ICdEZWZhdWx0IFRpdGxlJ1xuICAgICAgPyBgPHAgY2xhc3M9XCJjYXJ0LWl0ZW1fX3ZhcmlhbnRcIj4ke2l0ZW0udmFyaWFudF90aXRsZX08L3A+YFxuICAgICAgOiAnJztcblxuICAgIHJldHVybiBgXG4gICAgICA8ZGl2IGNsYXNzPVwiY2FydC1pdGVtXCIgZGF0YS1rZXk9XCIke2l0ZW0ua2V5fVwiPlxuICAgICAgICA8YSBocmVmPVwiJHtpdGVtLnVybH1cIiBjbGFzcz1cImNhcnQtaXRlbV9faW1hZ2UtbGlua1wiIHRhYmluZGV4PVwiLTFcIj5cbiAgICAgICAgICAke2ltZ1NyY1xuICAgICAgICAgICAgPyBgPGltZyBzcmM9XCIke2ltZ1NyYy5yZXBsYWNlKCc/JywgJz93aWR0aD0xNTAmJyl9XCIgYWx0PVwiJHtpdGVtLnByb2R1Y3RfdGl0bGV9XCIgd2lkdGg9XCI4MFwiIGhlaWdodD1cIjgwXCIgbG9hZGluZz1cImxhenlcIj5gXG4gICAgICAgICAgICA6ICc8ZGl2IGNsYXNzPVwiY2FydC1pdGVtX19pbWFnZS1wbGFjZWhvbGRlclwiPjwvZGl2PidcbiAgICAgICAgICB9XG4gICAgICAgIDwvYT5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhcnQtaXRlbV9faW5mb1wiPlxuICAgICAgICAgIDxhIGhyZWY9XCIke2l0ZW0udXJsfVwiIGNsYXNzPVwiY2FydC1pdGVtX190aXRsZVwiPiR7aXRlbS5wcm9kdWN0X3RpdGxlfTwvYT5cbiAgICAgICAgICAke3ZhcmlhbnRMYWJlbH1cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FydC1pdGVtX19ib3R0b21cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJxdHktaW5wdXQgcXR5LWlucHV0LS1zbVwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicXR5LWlucHV0X19idG5cIiBkYXRhLWFjdGlvbj1cImRlY3JlYXNlXCIgZGF0YS1rZXk9XCIke2l0ZW0ua2V5fVwiIGRhdGEtcXR5PVwiJHtpdGVtLnF1YW50aXR5fVwiIGFyaWEtbGFiZWw9XCJEZWNyZWFzZSBxdWFudGl0eVwiPlx1MjIxMjwvYnV0dG9uPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInF0eS1pbnB1dF9fdmFsdWVcIj4ke2l0ZW0ucXVhbnRpdHl9PC9zcGFuPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicXR5LWlucHV0X19idG5cIiBkYXRhLWFjdGlvbj1cImluY3JlYXNlXCIgZGF0YS1rZXk9XCIke2l0ZW0ua2V5fVwiIGRhdGEtcXR5PVwiJHtpdGVtLnF1YW50aXR5fVwiIGFyaWEtbGFiZWw9XCJJbmNyZWFzZSBxdWFudGl0eVwiPis8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJjYXJ0LWl0ZW1fX3ByaWNlXCI+JHtmb3JtYXRNb25leShpdGVtLmZpbmFsX2xpbmVfcHJpY2UpfTwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJjYXJ0LWl0ZW1fX3JlbW92ZVwiIGRhdGEta2V5PVwiJHtpdGVtLmtleX1cIiBhcmlhLWxhYmVsPVwiUmVtb3ZlICR7aXRlbS5wcm9kdWN0X3RpdGxlfVwiPlx1MDBENzwvYnV0dG9uPlxuICAgICAgPC9kaXY+YDtcbiAgfVxuXG4gIHByaXZhdGUgYmluZEl0ZW1FdmVudHMoKTogdm9pZCB7XG4gICAgdGhpcy5ib2R5Py5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PignW2RhdGEtYWN0aW9uXScpLmZvckVhY2goYnRuID0+IHtcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3Qga2V5ID0gYnRuLmRhdGFzZXQua2V5ITtcbiAgICAgICAgY29uc3QgcXR5ID0gcGFyc2VJbnQoYnRuLmRhdGFzZXQucXR5ID8/ICcxJywgMTApO1xuICAgICAgICBjb25zdCBuZXdRdHkgPSBidG4uZGF0YXNldC5hY3Rpb24gPT09ICdpbmNyZWFzZScgPyBxdHkgKyAxIDogTWF0aC5tYXgoMCwgcXR5IC0gMSk7XG4gICAgICAgIHZvaWQgQ2FydEFQSS5jaGFuZ2UoeyBpZDoga2V5LCBxdWFudGl0eTogbmV3UXR5IH0pLnRoZW4oKCkgPT4gdGhpcy5yZWZyZXNoKCkpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmJvZHk/LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KCcuY2FydC1pdGVtX19yZW1vdmUnKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHZvaWQgQ2FydEFQSS5jaGFuZ2UoeyBpZDogYnRuLmRhdGFzZXQua2V5ISwgcXVhbnRpdHk6IDAgfSkudGhlbigoKSA9PiB0aGlzLnJlZnJlc2goKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYmluZEV2ZW50cygpOiB2b2lkIHtcbiAgICAkPEhUTUxCdXR0b25FbGVtZW50PignI0NhcnRUb2dnbGUnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLm9wZW4oKSk7XG4gICAgJDxIVE1MQnV0dG9uRWxlbWVudD4oJyNDYXJ0RHJhd2VyQ2xvc2UnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgIHRoaXMub3ZlcmxheT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgaWYgKGUua2V5ID09PSAnRXNjYXBlJykgdGhpcy5jbG9zZSgpO1xuICAgIH0pO1xuXG4gICAgLy8gR2xvYmFsIEFkZC10by1DYXJ0IGRlbGVnYXRpb25cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jIChlKSA9PiB7XG4gICAgICBjb25zdCBidG4gPSAoZS50YXJnZXQgYXMgRWxlbWVudCkuY2xvc2VzdDxIVE1MQnV0dG9uRWxlbWVudD4oJ1tkYXRhLWF0Y10nKTtcbiAgICAgIGlmICghYnRuKSByZXR1cm47XG4gICAgICBjb25zdCB2YXJpYW50SWQgPSBOdW1iZXIoYnRuLmRhdGFzZXQudmFyaWFudElkKTtcbiAgICAgIGlmICghdmFyaWFudElkKSByZXR1cm47XG5cbiAgICAgIGJ0bi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICBjb25zdCBvcmlnaW5hbCA9IGJ0bi50ZXh0Q29udGVudCA/PyAnQWRkIHRvIENhcnQnO1xuICAgICAgYnRuLnRleHRDb250ZW50ID0gJ0FkZGluZ1x1MjAyNic7XG5cbiAgICAgIGF3YWl0IHRoaXMuYWRkSXRlbSh2YXJpYW50SWQpO1xuXG4gICAgICBidG4udGV4dENvbnRlbnQgPSAnQWRkZWQgXHUyNzEzJztcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBidG4udGV4dENvbnRlbnQgPSBvcmlnaW5hbDtcbiAgICAgICAgYnRuLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICB9LCAyMDAwKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvd1RvYXN0KG1zZzogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gVE9ETzogd2lyZSB1cCBhIHJlYWwgdG9hc3QgVUlcbiAgICBjb25zb2xlLndhcm4oJ1tDYXJ0XScsIG1zZyk7XG4gIH1cbn1cblxuLy8gSW5pdGlhbGlzZSBhbmQgZXhwb3NlIGNsb3NlIGdsb2JhbGx5XG5jb25zdCBjYXJ0RHJhd2VyID0gbmV3IENhcnREcmF3ZXIoKTtcblxuKHdpbmRvdyBhcyBXaW5kb3cgJiB7IGNsb3NlQ2FydERyYXdlcj86ICgpID0+IHZvaWQgfSkuY2xvc2VDYXJ0RHJhd2VyID1cbiAgKCkgPT4gY2FydERyYXdlci5jbG9zZSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBU0EsTUFBTSxVQUFVO0FBQUEsSUFDZCxnQkFBZ0I7QUFBQSxJQUNoQixRQUFRO0FBQUEsRUFDVjtBQUVBLGlCQUFlLGFBQWdCLEtBQWEsU0FBbUM7QUFDN0UsVUFBTSxNQUFNLE1BQU0sTUFBTSxLQUFLLEVBQUUsR0FBRyxTQUFTLFNBQVMsUUFBUSxDQUFDO0FBQzdELFFBQUksQ0FBQyxJQUFJLElBQUk7QUFDWCxZQUFNLFFBQVEsTUFBTSxJQUFJLEtBQUssRUFBRSxNQUFNLE9BQU8sQ0FBQyxFQUFFO0FBQy9DLFlBQU0sSUFBSSxNQUFNLE1BQU0sZUFBZSxtQkFBbUIsSUFBSSxNQUFNLEVBQUU7QUFBQSxJQUN0RTtBQUNBLFdBQU8sSUFBSSxLQUFLO0FBQUEsRUFDbEI7QUFFTyxNQUFNLFVBQVU7QUFBQSxJQUNyQixLQUFLLE1BQ0gsYUFBYSxVQUFVO0FBQUEsSUFFekIsS0FBSyxDQUFDLFlBQ0osYUFBYSxnQkFBZ0I7QUFBQSxNQUMzQixRQUFRO0FBQUEsTUFDUixNQUFNLEtBQUssVUFBVSxPQUFPO0FBQUEsSUFDOUIsQ0FBQztBQUFBLElBRUgsUUFBUSxDQUFDLFlBQ1AsYUFBYSxtQkFBbUI7QUFBQSxNQUM5QixRQUFRO0FBQUEsTUFDUixNQUFNLEtBQUssVUFBVSxPQUFPO0FBQUEsSUFDOUIsQ0FBQztBQUFBLElBRUgsUUFBUSxDQUFDLFlBQ1AsYUFBYSxtQkFBbUI7QUFBQSxNQUM5QixRQUFRO0FBQUEsTUFDUixNQUFNLEtBQUssVUFBVSxFQUFFLFFBQVEsQ0FBQztBQUFBLElBQ2xDLENBQUM7QUFBQSxJQUVILFNBQVMsQ0FB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
