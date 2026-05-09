// ============================================================
// SAHIBZADA GUN HOUSE — Admin Dashboard Logic
// ============================================================

let localProducts = [];
let localCategories = [];
let localBrands = [];

async function init() {
  document.getElementById('loading-status').style.display = 'block';
  const data = await loadInventory();
  localProducts = data.products || [];
  localCategories = data.categories || [];
  localBrands = data.brands || [];
  document.getElementById('loading-status').style.display = 'none';

  renderTable();
  renderCategories();
  renderBrands();
  populateSelects();
  loadAndRenderEnquiries();

  document.getElementById('p-license').addEventListener('change', (e) => {
    document.getElementById('license-type-group').style.display = e.target.checked ? 'block' : 'none';
  });

  document.getElementById('p-type').addEventListener('change', (e) => {
    document.getElementById('p-condition-group').style.display = (e.target.value === 'pre-owned') ? 'block' : 'none';
  });

  document.getElementById('p-name').addEventListener('input', (e) => {
    const editIndex = document.getElementById('edit-index').value;
    if (editIndex === '-1') {
      const slug = e.target.value.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      document.getElementById('p-slug').value = slug;
      if (!document.getElementById('p-id').value) {
        document.getElementById('p-id').value = slug;
      }
    }
  });


  document.getElementById('p-image-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');
      document.getElementById('preview-placeholder').textContent = 'Uploading...';

      try {
        const response = await fetch(`../upload.php`, {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.status === 'success' && result.url) {
          const absoluteUrl = result.url; // Path relative to project root
          const previewUrl = '../' + absoluteUrl; // Path relative to this folder
          document.getElementById('image-preview').src = previewUrl;
          document.getElementById('image-preview').style.display = 'block';
          document.getElementById('preview-placeholder').style.display = 'none';
          document.getElementById('image-preview').dataset.url = absoluteUrl; // Store root-relative path
          console.log('Local Upload Success:', absoluteUrl);
        } else {
          alert('Upload failed: ' + (result.message || 'Unknown error'));
          document.getElementById('preview-placeholder').textContent = 'No Image';
        }
      } catch (error) {
        console.error('Error uploading:', error);
        alert('Upload failed. Check your connection.');
        document.getElementById('preview-placeholder').textContent = 'No Image';
      }
    }
  });

  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveProduct();
  });
}

async function publishLive() {
  const btn = document.getElementById('save-btn');
  const originalText = btn.textContent;
  try {
    btn.innerHTML = '<span class="spinner"></span> Syncing...';
    btn.disabled = true;
    const success = await saveInventory({
      products: localProducts,
      categories: localCategories,
      brands: localBrands
    });
    if (success) {
      showAdminNotification('✅ Website updated successfully!');
    }
  } catch (error) {
    console.error('Critical sync error:', error);
    alert('Critical error during sync: ' + error.message);
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

function showAdminNotification(msg) {
  const div = document.createElement('div');
  div.className = 'toast show';
  div.style.cssText = 'background:var(--emerald-900);color:white;bottom:2rem;right:2rem;left:auto;width:auto;position:fixed;z-index:9999;padding:1rem 1.5rem;border-radius:8px;';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function renderTable() {
  const tbody = document.getElementById('admin-product-table');
  if (!tbody) return;
  tbody.innerHTML = localProducts.map((p, index) => {
    const priceStr = (p.priceInr / 100).toLocaleString('en-IN');
    const stockIcon = p.inStock !== false ? '✅' : '❌';
    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.75rem;">${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td><span class="badge-category">${p.category}</span></td>
        <td>₹${priceStr}</td>
        <td>${stockIcon}</td>
        <td class="action-btns">
          <button onclick="openEditModal(${index})" class="btn-outline-emerald btn-sm">Edit</button>
          <button onclick="deleteProduct(${index})" class="btn-danger btn-sm">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

function renderCategories() {
  const tbody = document.getElementById('admin-category-table');
  if (!tbody) return;
  tbody.innerHTML = localCategories.map((c, index) => `
    <tr>
      <td><strong>${c.name}</strong> <small style="color:var(--charcoal-400)">(${c.slug})</small></td>
      <td style="text-align:right">
        <button onclick="deleteCategory(${index})" class="btn-danger btn-sm">✕</button>
      </td>
    </tr>`).join('');
}

function renderBrands() {
  const tbody = document.getElementById('admin-brand-table');
  if (!tbody) return;
  tbody.innerHTML = localBrands.map((b, index) => `
    <tr>
      <td><strong>${b.name}</strong> ${b.authorized ? '⭐' : ''}</td>
      <td style="text-align:right">
        <button onclick="deleteBrand(${index})" class="btn-danger btn-sm">✕</button>
      </td>
    </tr>`).join('');
}

function addCategory() {
  const name = prompt('Category Name (e.g. Tactical Gear):');
  if (!name) return;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  localCategories.push({ slug, name });
  renderCategories();
  populateSelects();
}

function deleteCategory(index) {
  if (confirm('Delete this category?')) {
    localCategories.splice(index, 1);
    renderCategories();
    populateSelects();
  }
}

function addBrand() {
  const name = prompt('Brand Name:');
  if (!name) return;
  const auth = confirm('Is this an authorized brand?');
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  localBrands.push({ slug, name, authorized: auth });
  renderBrands();
  populateSelects();
}

function deleteBrand(index) {
  if (confirm('Delete this brand?')) {
    localBrands.splice(index, 1);
    renderBrands();
    populateSelects();
  }
}

function populateSelects() {
  const catSelect = document.getElementById('p-category');
  catSelect.innerHTML = localCategories.map(c => `<option value="${c.slug}">${c.name}</option>`).join('');
  const brandSelect = document.getElementById('p-brand');
  brandSelect.innerHTML = localBrands.map(b => `<option value="${b.slug}">${b.name}</option>`).join('');
}

function openAddModal() {
  document.getElementById('form-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('p-condition-group').style.display = 'none';
  document.getElementById('edit-index').value = '-1';
  document.getElementById('product-form-container').classList.add('active');
  document.getElementById('license-type-group').style.display = 'none';
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('preview-placeholder').style.display = 'block';
  document.getElementById('preview-placeholder').textContent = 'No Image';
}

function openEditModal(index) {
  const p = localProducts[index];
  document.getElementById('form-title').textContent = 'Edit Product';
  document.getElementById('edit-index').value = index;
  document.getElementById('p-id').value = p.id;
  document.getElementById('p-slug').value = p.slug;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-desc').value = p.shortDesc;
  document.getElementById('p-category').value = p.category;
  document.getElementById('p-type').value = p.type || 'new';
  document.getElementById('p-brand').value = p.brand || '';
  document.getElementById('p-condition').value = p.condition || 'excellent';
  document.getElementById('p-condition-group').style.display = (p.type === 'pre-owned') ? 'block' : 'none';
  document.getElementById('p-price').value = p.priceInr;
  document.getElementById('p-compare').value = p.compareAtInr || '';
  document.getElementById('p-caliber').value = p.caliber || '';
  document.getElementById('p-capacity').value = p.capacity || '';
  document.getElementById('p-license').checked = p.licenseRequired;
  document.getElementById('p-featured').checked = p.isFeatured;
  document.getElementById('p-stock').checked = p.inStock !== false;
  document.getElementById('p-license-text').value = p.licenseType || '';

  const preview = document.getElementById('image-preview');
  const placeholder = document.getElementById('preview-placeholder');
  if (typeof p.image === 'string' && !p.image.startsWith('SVG_')) {
    preview.src = p.image;
    preview.dataset.url = p.image;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    document.getElementById('p-image-type').value = 'upload';
  } else {
    preview.style.display = 'none';
    placeholder.style.display = 'block';
    placeholder.textContent = 'Illustration';
    document.getElementById('p-image-type').value = 'illustration';
  }

  document.getElementById('license-type-group').style.display = p.licenseRequired ? 'block' : 'none';
  document.getElementById('product-form-container').classList.add('active');
}

function closeModal() {
  document.getElementById('product-form-container').classList.remove('active');
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('preview-placeholder').style.display = 'block';
  document.getElementById('preview-placeholder').textContent = 'No Image';
}

function saveProduct() {
  const index = parseInt(document.getElementById('edit-index').value);
  const category = document.getElementById('p-category').value;
  const type = document.getElementById('p-type').value;
  const imageType = document.getElementById('p-image-type').value;

  let imageSource = '';
  if (imageType === 'upload') {
    imageSource = document.getElementById('image-preview').dataset.url || '';
    if (!imageSource) {
      alert('Please upload an image or select "Default Illustration"');
      return;
    }
  } else {
    imageSource = 'SVG_PISTOL_GOLD';
    if (category === 'revolvers') imageSource = 'SVG_REVOLVER';
    if (category === 'air-rifles') imageSource = 'SVG_RIFLE';
    if (category === 'holsters') imageSource = 'SVG_HOLSTER';
    if (category === 'optics') imageSource = 'SVG_OPTIC';
    if (category === 'cleaning') imageSource = 'SVG_CLEANING';
    if (category === 'ammunition') imageSource = 'SVG_AMMO';
  }

  const newProduct = {
    id: document.getElementById('p-id').value,
    slug: document.getElementById('p-slug').value,
    name: document.getElementById('p-name').value,
    shortDesc: document.getElementById('p-desc').value,
    licenseRequired: document.getElementById('p-license').checked,
    licenseType: document.getElementById('p-license-text').value || null,
    priceInr: parseInt(document.getElementById('p-price').value),
    compareAtInr: parseInt(document.getElementById('p-compare').value) || null,
    caliber: document.getElementById('p-caliber').value || null,
    capacity: document.getElementById('p-capacity').value || null,
    category: category,
    type: type,
    condition: type === 'pre-owned' ? document.getElementById('p-condition').value : null,
    brand: document.getElementById('p-brand').value,
    isFeatured: document.getElementById('p-featured').checked,
    inStock: document.getElementById('p-stock').checked,
    image: imageSource,
    createdAt: Date.now()
  };

  if (index === -1) {
    localProducts.unshift(newProduct);
  } else {
    localProducts[index] = newProduct;
  }

  renderTable();
  closeModal();
  showAdminNotification('Product saved! Click "Update Live Website" to publish.');
}

function deleteProduct(index) {
  if (confirm('Are you sure you want to delete this product?')) {
    localProducts.splice(index, 1);
    renderTable();
  }
}

async function loadAndRenderEnquiries() {
  const container = document.getElementById('enquiries-container');
  if (!container) return;
  container.innerHTML = '<p style="color: var(--charcoal-400); text-align: center; padding: 1rem;">Loading enquiries...</p>';

  const enquiries = await loadEnquiries();

  if (!enquiries || enquiries.length === 0) {
    container.innerHTML = '<p style="color: var(--charcoal-400); text-align: center; padding: 1rem;">No enquiries found.</p>';
    return;
  }

  const cards = enquiries.map(e => {
    const dateStr = new Date(e.timestamp || Date.now()).toLocaleString();
    const customerName = e.customerName || e.email || 'Unknown Customer';
    const safeId = String(e.id || '').replace(/'/g, '');

    // License badge
    const licenseBadge = e.hasLicense
      ? '<span style="background:#d1fae5;color:#065f46;font-size:10px;padding:2px 6px;border-radius:4px;">✔ LICENSED</span>'
      : '<span style="background:#fee2e2;color:#991b1b;font-size:10px;padding:2px 6px;border-radius:4px;">✘ NO LICENSE</span>';

    // Docs action
    const docUrls = e.documentUrls || [];
    let docsBtn = '';
    if (docUrls.length > 0) {
      // Store URLs in a data attribute to avoid inline JSON in onclick
      const urlsAttr = docUrls.join(',');
      docsBtn = `<button class="btn-outline-emerald btn-sm" data-urls="${encodeURIComponent(urlsAttr)}" onclick="viewCloudDocsFromAttr(this)">View Photos (Cloud)</button>`;
    } else {
      docsBtn = `<a href="api/view_docs.php?user=${encodeURIComponent(customerName)}" target="_blank" class="btn-outline-emerald btn-sm" style="text-decoration:none;">View Photos</a>`;
    }

    // UIN and license state rows
    const uinRow = e.uin ? `<div><strong>UIN:</strong> ${e.uin}</div>` : '';
    const licStateRow = e.licenseState ? `<div><strong>Lic State:</strong> ${e.licenseState}</div>` : '';
    const messageRow = e.message ? `<p style="margin:0 0 0.75rem;font-size:0.85rem;color:var(--charcoal-600);border-left:2px solid var(--admin-border);padding-left:0.5rem;">"${e.message}"</p>` : '';

    const bg = e.status === 'new' ? '#fffbeb' : 'white';

    return `<div style="border:1px solid var(--admin-border);border-radius:8px;padding:1rem;background:${bg};">
      <div class="enquiry-header" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
        <div>
          <h4 style="margin:0;">${customerName} <small style="font-weight:normal;color:var(--charcoal-500);">(${e.city || 'N/A'}, ${e.state || 'N/A'})</small></h4>
          <p style="margin:0.25rem 0;font-size:0.9rem;"><strong>Product:</strong> ${e.productName || 'N/A'}</p>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem;color:var(--charcoal-400);">${dateStr}</span>
          <div style="margin-top:0.25rem;">${licenseBadge}</div>
        </div>
      </div>
      <div class="enquiry-contact-grid" style="font-size:0.85rem;display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;background:rgba(0,0,0,0.02);padding:0.5rem;border-radius:4px;">
        <div>📞 ${e.customerPhone || 'N/A'}</div>
        <div>📧 ${e.customerEmail || 'N/A'}</div>
        ${uinRow}${licStateRow}
      </div>
      ${messageRow}
      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
        <button class="btn-emerald btn-sm" style="background:#27ae60;" data-name="${encodeURIComponent(customerName)}" onclick="verifyUserFromAttr(this)">Verify Documents</button>
        ${docsBtn}
        <button onclick="deleteEnquiry('${safeId}')" class="btn-danger btn-sm" style="margin-left:auto;">Delete</button>
      </div>
    </div>`;
  });

  container.innerHTML = cards.join('');
}

function verifyUserFromAttr(btn) {
  const fullName = decodeURIComponent(btn.dataset.name || '');
  if (!fullName) return;
  if (!confirm('Verify documents for ' + fullName + '? This will unlock the VERIFIED badge for the customer.')) return;
  const verifiedUsers = JSON.parse(localStorage.getItem('sgh_verified_users') || '[]');
  if (!verifiedUsers.includes(fullName)) {
    verifiedUsers.push(fullName);
    localStorage.setItem('sgh_verified_users', JSON.stringify(verifiedUsers));
  }
  alert('User ' + fullName + ' has been verified!');
  loadAndRenderEnquiries();
}

function viewCloudDocsFromAttr(btn) {
  const urls = decodeURIComponent(btn.dataset.urls || '').split(',').filter(Boolean);
  if (!urls.length) return;
  const win = window.open('', '_blank');
  const imgTags = urls.map(u => '<img src="' + u + '" style="max-width:400px;border:2px solid #444;border-radius:8px;" />').join('');
  win.document.write('<html><head><title>Document Gallery</title></head><body style="background:#111;color:white;font-family:sans-serif;padding:20px;display:flex;flex-wrap:wrap;gap:20px;">' + imgTags + '</body></html>');
}

async function deleteEnquiry(id) {
  if (!confirm('Are you sure you want to permanently delete this enquiry?')) return;
  const success = await deleteEnquiryFromDB(id);
  if (success) {
    showAdminNotification('🗑️ Enquiry deleted successfully.');
    loadAndRenderEnquiries();
  } else {
    alert('Failed to delete enquiry. Please try again.');
  }
}

async function exportEnquiriesToCSV() {
  const enquiries = await loadEnquiries();
  if (!enquiries || enquiries.length === 0) {
    alert('No enquiries to export.');
    return;
  }
  const headers = ['Date', 'Customer Name', 'Email', 'Phone', 'Location', 'Product/Items', 'Total Amount', 'License Holder', 'UIN', 'Status', 'Docs Link'];
  const rows = enquiries.map(e => {
    const date = new Date(e.timestamp).toLocaleString();
    const docsLink = window.location.origin + '/api/view_docs.php?user=' + encodeURIComponent(e.customerName || '');
    const location = ((e.city || '') + ' ' + (e.state || e.location || '')).trim();
    return [
      date, e.customerName, e.customerEmail || e.email, e.customerPhone || e.phone,
      location, e.productName || e.items, e.totalAmount || 'N/A',
      e.hasLicense ? 'Yes' : 'No', e.uin || 'N/A', e.status, docsLink
    ].map(val => '"' + String(val || '').replace(/"/g, '""') + '"').join(',');
  });
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'enquiries_export_' + new Date().toISOString().split('T')[0] + '.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Boot
init();
