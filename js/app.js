// ============================================================
// STATE
// ============================================================
const state = {
  route: 'home',
  filters: {
    category: null,
    brand: null,
    condition: null,
    type: null,
  },
  sort: 'newest',
  cart: JSON.parse(localStorage.getItem('sgh_cart') || '[]'),
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
function isAccessory(p) {
  const accCats = ['accessories', 'holsters', 'optics', 'cleaning', 'tactical-gear'];
  return accCats.includes(p.category);
}

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
    const isAcc = isAccessory(product);
    
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
        <button class="product-action outline" onclick="${isAcc ? `openRedirectModal('${product.id}')` : `addToCart('${product.id}')`}" ${!inStock ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          ${isAcc ? 'Buy in CO2 Division' : (inStock ? 'Add to Cart' : 'Notify Me')}
        </button>
      </div>
    `;
  }

  let badgeHtml = '';
  const badges = [];

  if (product.licenseRequired) {
    badges.push(`<div class="badge badge-license">🔒 License Required</div>`);
  } else if (product.compareAtInr && product.compareAtInr > product.priceInr) {
    const savings = product.compareAtInr - product.priceInr;
    badges.push(`<div class="badge badge-sale">Save ${formatInr(savings)}</div>`);
  } else if (product.inStock === false) {
    badges.push(`<div class="badge badge-stock">Out of Stock</div>`);
  }

  if (product.type === 'pre-owned') {
    badges.push(`<div class="badge badge-pre-owned">🔖 Pre-Owned</div>`);
  }

  badgeHtml = badges.length ? `<div class="badge-stack">${badges.join('')}</div>` : '';

  // Handle image SVG string vs URL
  let imageContent = product.image;
  if (typeof imageContent === 'string') {
    if (imageContent.startsWith('SVG_')) {
      // If it's a variable name, get the content from window
      imageContent = window[imageContent] || '';
    } else if (imageContent !== '') {
      // If it's a URL or path, render an img tag
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
        ${product.type === 'pre-owned' && product.condition ? `<p class="product-spec"><strong>Condition:</strong> <span style="text-transform: capitalize;">${product.condition.replace('-', ' ')}</span></p>` : ''}
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
  // Update Type buttons
  ['new', 'pre-owned', 'ammunition'].forEach(t => {
    const btn = document.getElementById(`filter-type-${t}`);
    if (btn) btn.classList.toggle('active', state.filters.type === t);
  });

  // Categories
  const categoryList = document.getElementById('category-list');
  if (categoryList) {
    let categories = state.inventory.categories.filter(c => !c.division || c.division === 'main' || c.division === 'both');
    // Main page: only count license-required products OR accessories
    const mainProducts = state.inventory.products.filter(p => p.licenseRequired || isAccessory(p));

    if (state.filters.type) {
      categories = categories.filter(c => c.type === state.filters.type);
    }

    categoryList.innerHTML = categories.map(c => {
      const count = mainProducts.filter(p => p.category === c.slug).length;
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
  }

  // Conditions
  const conditionGroup = document.getElementById('condition-filter-group');
  if (conditionGroup) {
    const isPreOwned = state.filters.type === 'pre-owned';
    conditionGroup.style.display = isPreOwned ? 'block' : 'none';

    if (isPreOwned) {
      const conditionList = document.getElementById('condition-list');
      if (conditionList) {
        const conditions = window.CONDITIONS || [
          { slug: 'excellent', name: 'Excellent' },
          { slug: 'good',      name: 'Good' },
          { slug: 'average',   name: 'Average' },
          { slug: 'as-is',     name: 'As Is condition' },
        ];
        // Main page: only count license-required products
        const mainProducts = state.inventory.products.filter(p => p.licenseRequired);

        conditionList.innerHTML = conditions.map(c => {
          const count = mainProducts.filter(p => p.condition === c.slug && p.type === 'pre-owned').length;
          const active = state.filters.condition === c.slug ? 'active' : '';
          return `
            <li>
              <button class="${active}" onclick="toggleFilter('condition', '${c.slug}')">
                <span style="display: flex; align-items: center; gap: 0.5rem;">
                  ${active ? '<span style="color: var(--gold-500);">✓</span>' : ''}
                  ${c.name}
                </span>
                <span class="filter-count">${count}</span>
              </button>
            </li>
          `;
        }).join('');
      }
    }
  }

  const brandList = document.getElementById('brand-list');
  if (!brandList) return;
  // Main page: only count license-required products
  const mainProducts = state.inventory.products.filter(p => p.licenseRequired);

  brandList.innerHTML = state.inventory.brands.map(b => {
    const count = mainProducts.filter(p => p.brand === b.slug).length;
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

  const hasActive = state.filters.category || state.filters.brand || state.filters.condition || state.filters.type;
  const clearBtn = document.getElementById('filter-clear-btn');
  if (clearBtn) clearBtn.classList.toggle('hidden', !hasActive);
}

function toggleFilter(type, value) {
  state.filters[type] = state.filters[type] === value ? null : value;
  
  // If type changed and is not pre-owned, clear condition filter
  if (type === 'type' && state.filters.type !== 'pre-owned') {
    state.filters.condition = null;
  }
  
  renderFilterLists();
  renderShop();
}

function clearFilters() {
  state.filters = { category: null, brand: null, condition: null, type: null };
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
  // Main page: show licensed items OR accessories
  const featured = state.inventory.products.filter(p => p.isFeatured && (p.licenseRequired || isAccessory(p))).slice(0, 8);
  grid.innerHTML = featured.map(renderProductCard).join('');
}

function renderShop() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  // Main page: show licensed items OR accessories
  let filtered = state.inventory.products.filter(p => p.licenseRequired || isAccessory(p));
  
  if (state.filters.category) {
    filtered = filtered.filter(p => p.category === state.filters.category);
  }
  if (state.filters.type) {
    filtered = filtered.filter(p => p.type === state.filters.type);
  }
  if (state.filters.brand) {
    filtered = filtered.filter(p => p.brand === state.filters.brand);
  }
  if (state.filters.condition) {
    filtered = filtered.filter(p => p.condition === state.filters.condition);
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
          <a href="javascript:clearFilters()" style="color: var(--emerald-900); text-decoration: underline;">view all firearms & ammunition</a>.
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

  state.currentQuoteProduct = product;
  const modalName = document.getElementById('modal-product-name');
  const modalPrice = document.getElementById('modal-product-price');
  const modal = document.getElementById('quote-modal');

  if (modalName) modalName.textContent = product.name;
  if (modalPrice) modalPrice.textContent = `Indicative price: ${formatInr(product.priceInr)}`;
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // --- Pre-fill from profile if available ---
  const profileStr = localStorage.getItem('sgh_user_profile');
  if (profileStr) {
    const profile = JSON.parse(profileStr);
    const nameEl = document.getElementById('qr-name');
    const emailEl = document.getElementById('qr-email');
    const phoneEl = document.getElementById('qr-phone');
    const cityEl = document.getElementById('qr-city');

    if (nameEl) nameEl.value = (profile.firstName + ' ' + (profile.lastName || '')).trim();
    if (emailEl) emailEl.value = profile.email || '';
    if (phoneEl) phoneEl.value = profile.phone || '';
    if (cityEl) cityEl.value = profile.city || '';
  }

  // Check verification status for licensed products
  checkVerificationStatus();
}

function checkVerificationStatus() {
  if (!state.currentQuoteProduct || !state.currentQuoteProduct.licenseRequired) return;

  const isUploaded = CameraModule.isVerified();
  // Simulated verification check (checks if admin has verified this user in localStorage)
  const verifiedUsers = JSON.parse(localStorage.getItem('sgh_verified_users') || '[]');
  
  // Note: For a real app, this would be a server-side check. 
  // Here we check if the current user (if logged in or matched by name) is verified.
  // For the prototype, we check if ANY name in the verified list matches.
  const isVerified = verifiedUsers.length > 0; // Simplified for prototype

  const submitBtn = document.getElementById('quote-submit-btn');
  const badge = document.getElementById('doc-verified-badge');
  const statusText = document.getElementById('doc-status-text');
  const uploadBtn = document.getElementById('modal-upload-btn');

  if (isUploaded) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
    
    if (isVerified) {
      badge.style.display = 'block';
      badge.textContent = 'VERIFIED';
      badge.style.background = '#27ae60';
      statusText.textContent = 'Your documents have been verified by our team.';
      statusText.style.color = '#27ae60';
    } else {
      badge.style.display = 'block';
      badge.textContent = 'UPLOADED';
      badge.style.background = '#d4af37'; // Gold/Yellow for pending
      statusText.textContent = 'Documents uploaded. Reservation unlocked. Admin verification pending.';
      statusText.style.color = '#d4af37';
    }

    uploadBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      Update Documents
    `;
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
    badge.style.display = 'none';
    statusText.textContent = 'Aadhaar Card + Firearms License required to unlock reservation.';
    statusText.style.color = '#6d6d6d';
  }
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================
// REDIRECT MODAL (FOR ACCESSORIES ON MAIN PAGE)
// ============================================================
function openRedirectModal(productId) {
  let product = state.inventory.products.find(p => p.id === productId);
  
  const modal = document.getElementById('redirect-modal');
  if (!modal) {
    createRedirectModal();
  }
  
  const nameEl = document.getElementById('redirect-product-name');
  const goBtn = document.getElementById('redirect-go-btn');

  if (productId === 'general-accessory') {
    nameEl.textContent = 'Accessories & CO2 Gear';
    goBtn.onclick = () => {
      window.location.href = `Co2_guns/index.html`;
    };
  } else if (product) {
    nameEl.textContent = product.name;
    goBtn.onclick = () => {
      window.location.href = `Co2_guns/products.html?highlight=${product.id}`;
    };
  }
  
  document.getElementById('redirect-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeRedirectModal() {
  const modal = document.getElementById('redirect-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function createRedirectModal() {
  const html = `
    <div id="redirect-modal" class="modal-backdrop">
      <div class="modal" style="text-align: center; max-width: 450px;">
        <div style="margin-bottom: 2rem;">
          <div style="width: 80px; height: 80px; background: rgba(56, 189, 248, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-900)" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
          </div>
          <h2 style="font-family: var(--font-heading); color: var(--emerald-900);">Available in CO2 Division</h2>
          <p style="color: var(--charcoal-600); margin-top: 1rem;">
            The <strong id="redirect-product-name">Product</strong> and all accessories are managed through our specialized CO2 & Precision division.
          </p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <button id="redirect-go-btn" class="product-action primary" style="justify-content: center; width: 100%;">
            Go to CO2 Guns Page
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <button onclick="closeRedirectModal()" class="product-action outline" style="justify-content: center; width: 100%;">Stay on Main Page</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
  
  // Bind backdrop click
  document.getElementById('redirect-modal').addEventListener('click', (e) => {
    if (e.target.id === 'redirect-modal') closeRedirectModal();
  });
}

async function submitQuoteRequest(e) {
  e.preventDefault();
  
  if (!state.currentQuoteProduct) return;

  const enquiry = {
    productId: state.currentQuoteProduct.id,
    productName: state.currentQuoteProduct.name,
    customerName: document.getElementById('qr-name').value,
    customerPhone: document.getElementById('qr-phone').value,
    customerEmail: document.getElementById('qr-email').value,
    city: document.getElementById('qr-city').value,
    state: document.getElementById('qr-state').value,
    hasLicense: document.getElementById('qr-license').checked,
    uin: document.getElementById('qr-uin').value,
    licenseState: document.getElementById('qr-license-state').value,
    message: document.getElementById('qr-message').value,
    status: 'new'
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  // 1. If images exist, upload them first to ensure they are saved on server
  const capturedImages = JSON.parse(localStorage.getItem('sgh_captured_docs') || '[]');
  if (capturedImages.length >= 2) {
    try {
      await fetch('api/upload_docs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          images: capturedImages,
          userName: enquiry.customerName || 'Anonymous'
        })
      });
    } catch (err) {
      console.warn('Doc upload failed, continuing with enquiry', err);
    }
  }

  const success = await saveEnquiry(enquiry);

  if (success) {
    closeQuoteModal();
    showToast(`✅ Reservation submitted! We will contact you soon.`);
    e.target.reset();
  } else {
    showToast(`❌ Failed to submit. Please try again.`, true);
  }

  submitBtn.textContent = originalText;
  submitBtn.disabled = false;
}

// ============================================================
// CART
// ============================================================
function addToCart(productId) {
  // --- Check if profile exists ---
  const profile = localStorage.getItem('sgh_user_profile');
  if (!profile) {
    alert('Please complete your profile and upload your documents before adding items to the cart.');
    window.location.href = 'profile.html';
    return;
  }

  const product = state.inventory.products.find(p => p.id === productId);
  if (!product) return;

  if (product.licenseRequired) {
    console.error('[compliance] addToCart blocked: license required');
    showToast('This item requires in-store reservation.', true);
    return;
  }

  // Use the same storage key as cart.html
  const existingIndex = state.cart.findIndex(item => item.id === productId);
  if (existingIndex > -1) {
    state.cart[existingIndex].qty = (state.cart[existingIndex].qty || 1) + 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.priceInr / 100,
      brand: product.brand,
      image: (product.image && !product.image.startsWith('SVG_')) ? product.image : null,
      license: product.licenseRequired ? 'required' : 'none',
      qty: 1
    });
  }

  localStorage.setItem('sgh_cart', JSON.stringify(state.cart));
  updateCartBadge();
  showToast(`Added: ${product.name}`);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const badgeNav = document.getElementById('cart-badge-nav');
  
  const totalCount = state.cart.reduce((a, b) => a + (b.qty || 1), 0);
  
  if (badge) {
    badge.textContent = totalCount;
    badge.classList.toggle('hidden', totalCount === 0);
  }
  if (badgeNav) {
    badgeNav.textContent = totalCount;
    badgeNav.classList.toggle('hidden', totalCount === 0);
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
  updateCartBadge();

  // Mobile Menu Toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  // Initialize Camera Module
  if (typeof CameraModule !== 'undefined') {
    CameraModule.init((images) => {
      // Callback after camera close
      checkVerificationStatus();
      showToast(`Captured ${images.length} documents.`);
    });
  }

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
