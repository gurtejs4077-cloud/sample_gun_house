// ============================================================
// STATE
// ============================================================
const state = {
  route: 'home',
  filters: {
    category: null,
    brand: null,
    license: null,
  },
  sort: 'newest',
  cart: [],
  currentQuoteProduct: null,
  // Add live data holders
  inventory: {
    products: [],
    categories: [],
    brands: []
  }
};

// ============================================================
// UTILITIES
// ============================================================
function formatInr(paise, options = {}) {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

function getBrand(slug) { return state.inventory.brands.find(b => b.slug === slug); }
function getCategory(slug) { return state.inventory.categories.find(c => c.slug === slug); }

// ============================================================
// PRODUCT CARD RENDER
// ============================================================
function renderProductCard(product) {
  const category = getCategory(product.category);
  const brand = getBrand(product.brand);

  let ctaHtml;
  if (product.licenseRequired) {
    ctaHtml = `
      <div class="product-cta">
        <div class="product-price-row">
          <span class="product-price-label">Indicative Price</span>
          <span class="product-price">${formatInr(product.priceInr)}</span>
        </div>
        ${product.licenseType ? `
          <div class="license-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-700)" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>${product.licenseType}</span>
          </div>
        ` : ''}
        <button class="product-action primary" onclick="openQuoteModal('${product.id}')">
          Reserve in Store
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    `;
  } else {
    const inStock = product.inStock !== false;
    const sale = product.compareAtInr && product.compareAtInr > product.priceInr;
    ctaHtml = `
      <div class="product-cta">
        <div class="product-price-row">
          <div>
            <span class="product-price">${formatInr(product.priceInr)}</span>
            ${sale ? `<span class="product-price-old">${formatInr(product.compareAtInr)}</span>` : ''}
          </div>
          <span class="stock-indicator ${inStock ? 'in-stock' : 'out-of-stock'}">
            ${inStock ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
        <button class="product-action outline" onclick="addToCart('${product.id}')" ${!inStock ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          ${inStock ? 'Add to Cart' : 'Notify Me'}
        </button>
      </div>
    `;
  }

  let badgeHtml = '';
  if (product.licenseRequired) {
    badgeHtml = `<div class="badge badge-license">🔒 License Required</div>`;
  } else if (product.compareAtInr && product.compareAtInr > product.priceInr) {
    const savings = product.compareAtInr - product.priceInr;
    badgeHtml = `<div class="badge badge-sale">Save ${formatInr(savings)}</div>`;
  } else if (product.inStock === false) {
    badgeHtml = `<div class="badge badge-stock">Out of Stock</div>`;
  }

  // Handle image SVG string vs URL
  let imageContent = product.image;
  if (typeof imageContent === 'string') {
    if (imageContent.startsWith('SVG_')) {
      // If it's a variable name, get the content from window
      imageContent = window[imageContent] || '';
    } else if (imageContent.startsWith('http')) {
      // If it's a URL (Cloudinary), render an img tag
      imageContent = `<img src="${imageContent}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }
  }

  return `
    <article class="product-card fade-up">
      <div class="product-image">
        ${imageContent}
        ${badgeHtml}
      </div>
      <div class="product-details">
        <div class="product-meta">
          ${brand ? `<span class="product-meta-brand">${brand.name}</span>` : ''}
          ${brand && category ? '<span>·</span>' : ''}
          ${category ? `<span>${category.name}</span>` : ''}
        </div>
        <h3 class="product-name">${product.name}</h3>
        ${product.caliber ? `<p class="product-spec"><strong>Caliber:</strong> ${product.caliber}</p>` : ''}
        ${product.shortDesc ? `<p class="product-desc">${product.shortDesc}</p>` : ''}
        <div style="flex: 1;"></div>
        ${ctaHtml}
      </div>
    </article>
  `;
}

// ============================================================
// FILTERS
// ============================================================
function renderFilterLists() {
  const categoryList = document.getElementById('category-list');
  if (!categoryList) return;
  categoryList.innerHTML = state.inventory.categories.map(c => {
    const count = state.inventory.products.filter(p => p.category === c.slug).length;
    const active = state.filters.category === c.slug ? 'active' : '';
    return `
      <li>
        <button class="${active}" onclick="toggleFilter('category', '${c.slug}')">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            ${active ? '<span style="color: var(--gold-500);">✓</span>' : ''}
            ${c.name}
          </span>
          <span class="filter-count">${count}</span>
        </button>
      </li>
    `;
  }).join('');

  const brandList = document.getElementById('brand-list');
  if (!brandList) return;
  brandList.innerHTML = state.inventory.brands.map(b => {
    const count = state.inventory.products.filter(p => p.brand === b.slug).length;
    if (count === 0) return '';
    const active = state.filters.brand === b.slug ? 'active' : '';
    return `
      <li>
        <button class="${active}" onclick="toggleFilter('brand', '${b.slug}')">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            ${active ? '<span style="color: var(--gold-500);">✓</span>' : ''}
            ${b.name}
            ${b.authorized ? '<span style="background: var(--gold-100); color: #94731a; font-size: 9px; padding: 1px 4px; text-transform: uppercase; letter-spacing: 0.1em;">Authorized</span>' : ''}
          </span>
          <span class="filter-count">${count}</span>
        </button>
      </li>
    `;
  }).join('');

  document.querySelectorAll('.filter-pill[data-filter="license"]').forEach(btn => {
    if (state.filters.license === btn.dataset.value) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const hasActive = state.filters.category || state.filters.brand || state.filters.license;
  const clearBtn = document.getElementById('filter-clear-btn');
  if (clearBtn) clearBtn.classList.toggle('hidden', !hasActive);
}

function toggleFilter(type, value) {
  state.filters[type] = state.filters[type] === value ? null : value;
  renderFilterLists();
  renderShop();
}

function clearFilters() {
  state.filters = { category: null, brand: null, license: null };
  renderFilterLists();
  renderShop();
}

function applySort() {
  const sortSelect = document.getElementById('sort');
  if (sortSelect) {
    state.sort = sortSelect.value;
    renderShop();
  }
}

// ============================================================
// PAGE RENDERERS
// ============================================================
function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const featured = state.inventory.products.filter(p => p.isFeatured).slice(0, 8);
  grid.innerHTML = featured.map(renderProductCard).join('');
}

function renderShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  let filtered = state.inventory.products.slice();
  if (state.filters.category) {
    filtered = filtered.filter(p => p.category === state.filters.category);
  }
  if (state.filters.brand) {
    filtered = filtered.filter(p => p.brand === state.filters.brand);
  }
  if (state.filters.license === 'required') {
    filtered = filtered.filter(p => p.licenseRequired);
  } else if (state.filters.license === 'none') {
    filtered = filtered.filter(p => !p.licenseRequired);
  }

  switch (state.sort) {
    case 'price-asc':  filtered.sort((a, b) => a.priceInr - b.priceInr); break;
    case 'price-desc': filtered.sort((a, b) => b.priceInr - a.priceInr); break;
    case 'featured':   filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); break;
    case 'newest':
    default:           filtered.sort((a, b) => b.createdAt - a.createdAt); break;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 5rem; text-align: center; background: white; border: 1px solid var(--ivory-300);">
        <h2 style="font-size: 1.5rem;">No items match your filters</h2>
        <p style="margin-top: 0.75rem; color: var(--charcoal-600);">
          Try removing some filters or
          <a href="javascript:clearFilters()" style="color: var(--emerald-900); text-decoration: underline;">view the full catalogue</a>.
        </p>
      </div>
    `;
  } else {
    grid.innerHTML = filtered.map(renderProductCard).join('');
  }
  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = filtered.length;
}

// ============================================================
// ROUTER
// ============================================================
function navigateTo(route) {
  state.route = route;
  const homePage = document.getElementById('page-home');
  const shopPage = document.getElementById('page-shop');
  
  if (homePage) homePage.classList.toggle('hidden', route !== 'home');
  if (shopPage) shopPage.classList.toggle('hidden', route !== 'shop');

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (route === 'shop') {
    renderShop();
  }
}

// Bind nav clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-route]');
  if (link) {
    e.preventDefault();
    const route = link.dataset.route;
    const filterCategory = link.dataset.filterCategory;
    if (filterCategory) {
      state.filters.category = filterCategory;
      renderFilterLists();
    }
    navigateTo(route);
  }
});

// ============================================================
// QUOTE MODAL
// ============================================================
function openQuoteModal(productId) {
  const product = state.inventory.products.find(p => p.id === productId);
  if (!product) return;

  if (!product.licenseRequired) {
    console.error('[compliance] openQuoteModal called on non-licensed product');
    return;
  }

  state.currentQuoteProduct = product;
  const modalName = document.getElementById('modal-product-name');
  const modalPrice = document.getElementById('modal-product-price');
  const modal = document.getElementById('quote-modal');

  if (modalName) modalName.textContent = product.name;
  if (modalPrice) modalPrice.textContent = `Indicative price: ${formatInr(product.priceInr)}`;
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function submitQuoteRequest(e) {
  e.preventDefault();
  closeQuoteModal();
  showToast(`Reservation submitted. We'll contact you within 24 hours to schedule your showroom visit.`);
  e.target.reset();
}

// ============================================================
// CART
// ============================================================
function addToCart(productId) {
  const product = state.inventory.products.find(p => p.id === productId);
  if (!product) return;

  if (product.licenseRequired) {
    console.error('[compliance] addToCart blocked: license required');
    showToast('This item requires in-store reservation.', true);
    return;
  }

  state.cart.push(productId);
  updateCartBadge();
  showToast(`Added: ${product.name}`);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  if (state.cart.length > 0) {
    badge.textContent = state.cart.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.borderLeftColor = isError ? '#dc2626' : 'var(--gold-500)';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Load from Live DB
  if (typeof loadInventory === 'function') {
    const data = await loadInventory();
    state.inventory = data;
  } else {
    // Fallback if provider missing
    state.inventory = { products: PRODUCTS, categories: CATEGORIES, brands: BRANDS };
  }

  renderFeatured();
  renderFilterLists();
  renderShop();

  // Mobile Menu Toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      // Optional: change hamburger to X
      const spans = menuBtn.querySelectorAll('span');
      if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu on link click
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('active');
        const spans = menuBtn.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }
});

// Close modal on backdrop click
const modalBackdrop = document.getElementById('quote-modal');
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target.id === 'quote-modal') closeQuoteModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeQuoteModal();
});
