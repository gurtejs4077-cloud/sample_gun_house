// ============================================================
// STATE
// ============================================================
const state = {
  filters: {
    category: 'co2-guns', // Default for this division
    brand: null,
    condition: null,
    type: null,
  },
  sort: 'newest',
  cart: JSON.parse(localStorage.getItem('sgh_cart_co2') || '[]'),
  currentQuoteProduct: null,
  inventory: {
    products: [],
    categories: [],
    brands: []
  }
};

// ============================================================
// UTILITIES
// ============================================================
function formatInr(paise) {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

// ============================================================
// PRODUCT CARD RENDER
// ============================================================
function renderProductCard(product) {
  const isLicensed = product.licenseRequired;
  return `
    <article class="product-card fade-up">
      <div class="product-image-container">
        ${(product.image && !product.image.startsWith('SVG_')) ? 
          `<img src="${product.image.startsWith('http') ? product.image : '../' + product.image}" class="product-img" alt="${product.name}">` : 
          `<div class="product-img-placeholder">${(typeof window !== 'undefined' && window.SVG_MAP && window.SVG_MAP[product.image]) ? window.SVG_MAP[product.image] : (product.image || '')}</div>`
        }
      </div>
      <div class="product-details">
        <h3 class="product-name" style="margin-bottom: 0.5rem; font-family: var(--font-heading);">${product.name}</h3>
        <p style="color: var(--silver); font-size: 0.85rem; margin-bottom: 1rem;">${product.shortDesc || ''}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
          <span style="font-weight: 700; color: var(--accent);">${formatInr(product.priceInr)}</span>
          ${(product.licenseRequired && product.category !== 'air-rifles') ? 
            `<button class="btn-primary" onclick="openQuoteModal('${product.id}')" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Reserve</button>` :
            `<button class="btn-primary" onclick="addToCart('${product.id}')" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Add</button>`
          }
        </div>
      </div>
    </article>
  `;
}

// ============================================================
// RENDERERS
// ============================================================
function renderFeatured(category = 'co2-guns') {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  
  // CO2 division: Non-licensed items OR Air Rifles OR Accessories
  const products = state.inventory.products.filter(p => 
    (!p.licenseRequired || p.category === 'air-rifles' || ['accessories', 'holsters', 'optics', 'cleaning', 'tactical-gear'].includes(p.category)) && 
    (p.category === category || p.isFeatured)
  ).slice(0, 4);
  grid.innerHTML = products.map(renderProductCard).join('');
}

function renderFilterBar() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;

  const co2Categories = state.inventory.categories.filter(c => c.division === 'co2' || c.division === 'both');
  
  let html = `<button class="filter-btn active" onclick="filterByCategory('all', this)">All Systems</button>`;
  html += co2Categories.map(c => `
    <button class="filter-btn" onclick="filterByCategory('${c.slug}', this)">${c.name}</button>
  `).join('');
  
  bar.innerHTML = html;
}

window.filterByCategory = (slug, btn) => {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  if (slug === 'all') {
    renderAllProducts(null);
  } else {
    renderAllProducts(slug);
  }
};

function renderAllProducts(category = null) {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;
  
  // CO2 division: Non-licensed items OR Air Rifles OR Accessories
  let filtered = state.inventory.products.filter(p => 
    !p.licenseRequired || 
    p.category === 'air-rifles' || 
    p.category === 'co2-guns' || 
    ['accessories', 'holsters', 'optics', 'cleaning', 'tactical-gear'].includes(p.category)
  );
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  grid.innerHTML = filtered.map(renderProductCard).join('');
}

// ============================================================
// CART LOGIC
// ============================================================
function addToCart(productId) {
  const product = state.inventory.products.find(p => p.id === productId);
  if (!product) return;
  
  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }
  
  localStorage.setItem('sgh_cart_co2', JSON.stringify(state.cart));
  updateCartBadge();
  showToast(`Added: ${product.name}`);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;
  
  if (state.cart.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--silver); padding: 3rem;">Your selection is currently empty.</p>';
    return;
  }
  
  container.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img"></div>
      <div style="flex: 1;">
        <h4 style="color: var(--white);">${item.name}</h4>
        <p style="color: var(--silver); font-size: 0.8rem;">Qty: ${item.qty}</p>
      </div>
      <div style="text-align: right;">
        <p style="color: var(--accent); font-weight: 700;">${formatInr(item.priceInr * item.qty)}</p>
        <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; margin-top: 0.5rem;">Remove</button>
      </div>
    </div>
  `).join('');
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.priceInr * item.qty), 0);
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  
  if (subtotalEl) subtotalEl.textContent = formatInr(subtotal);
  if (totalEl) totalEl.textContent = formatInr(subtotal);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  localStorage.setItem('sgh_cart_co2', JSON.stringify(state.cart));
  updateCartBadge();
  renderCart();
}

// ============================================================
// RESERVATION MODAL LOGIC
// ============================================================
function openQuoteModal(productId) {
  const product = state.inventory.products.find(p => p.id === productId);
  if (!product) return;

  state.currentQuoteProduct = product;
  const modalName = document.getElementById('modal-product-name');
  const modalPrice = document.getElementById('modal-product-price');
  const modal = document.getElementById('quote-modal');

  if (modalName) modalName.textContent = product.name;
  if (modalPrice) modalPrice.textContent = formatInr(product.priceInr);
  if (modal) modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  checkVerificationStatus();
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function checkVerificationStatus() {
  if (typeof CameraModule === 'undefined') return;
  
  const isUploaded = CameraModule.isVerified();
  const submitBtn = document.getElementById('quote-submit-btn');
  const badge = document.getElementById('doc-verified-badge');
  const statusText = document.getElementById('doc-status-text');

  if (isUploaded) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    if (badge) {
      badge.style.display = 'block';
      badge.textContent = 'UPLOADED';
    }
    if (statusText) {
      statusText.textContent = 'Documents captured. Reservation unlocked.';
      statusText.style.color = 'var(--accent)';
    }
  } else {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    if (badge) badge.style.display = 'none';
    if (statusText) statusText.textContent = 'Identification required to secure precision equipment.';
  }
}

async function submitQuoteRequest(e) {
  e.preventDefault();
  if (!state.currentQuoteProduct) return;

  const enquiry = {
    productId: state.currentQuoteProduct.id,
    productName: state.currentQuoteProduct.name,
    customerName: document.getElementById('qr-name').value,
    customerPhone: document.getElementById('qr-phone').value,
    customerEmail: document.getElementById('qr-email')?.value || '',
    city: document.getElementById('qr-city')?.value || '',
    division: 'CO2',
    status: 'new',
    type: 'single-enquiry',
    createdAt: Date.now()
  };

  const submitBtn = document.getElementById('quote-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  const success = await saveEnquiry(enquiry);

  if (success) {
    closeQuoteModal();
    showToast(`✅ Reservation submitted for ${enquiry.productName}`);
    e.target.reset();
  } else {
    showToast('❌ Failed to connect to server. Try again.', true);
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Submit Reservation';
}

async function checkoutCart() {
  if (state.cart.length === 0) return;

  const submitBtn = document.getElementById('checkout-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  const enquiry = {
    customerName: 'Customer (Cart)', // In a real app, we'd get this from a form
    customerPhone: 'N/A',
    division: 'CO2',
    status: 'new',
    type: 'cart-order',
    items: state.cart,
    total: state.cart.reduce((a, b) => a + (b.price * b.qty), 0),
    createdAt: Date.now()
  };

  const success = await saveEnquiry(enquiry);

  if (success) {
    state.cart = [];
    localStorage.setItem('sgh_cart_co2', JSON.stringify(state.cart));
    updateCartBadge();
    renderCart();
    showToast('✅ Order submitted! Admin will contact you.');
  } else {
    showToast('❌ Checkout failed. Please try again.', true);
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Proceed to Reservation';
  }
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Load from Live Database
  if (typeof loadInventory === 'function') {
    const data = await loadInventory();
    state.inventory.products = data.products || [];
    state.inventory.categories = data.categories || [];
    state.inventory.brands = data.brands || [];
    
    // Re-render now that we have data
    renderFilterBar();
    if (document.getElementById('inventory-grid')) renderAllProducts();
    if (document.getElementById('featured-grid')) renderFeatured();
  } else if (typeof PRODUCTS !== 'undefined') {
    state.inventory.products = PRODUCTS;
    state.inventory.categories = CATEGORIES;
    state.inventory.brands = BRANDS;
  }
  
  updateCartBadge();
  if (document.getElementById('cart-items-container')) renderCart();
  renderFilterBar();

  // Initialize Camera Module Callback
  if (typeof CameraModule !== 'undefined') {
    CameraModule.init(() => {
      checkVerificationStatus();
    });
  }

  // Check for product highlighting from redirect
  const params = new URLSearchParams(window.location.search);
  const highlightId = params.get('highlight');
  if (highlightId) {
    setTimeout(() => {
      const el = document.querySelector(`[onclick*="${highlightId}"]`)?.closest('.product-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.boxShadow = '0 0 0 4px var(--accent)';
        el.style.transform = 'scale(1.05)';
        setTimeout(() => {
          el.style.boxShadow = '';
          el.style.transform = '';
        }, 3000);
      }
    }, 500);
  }
});
