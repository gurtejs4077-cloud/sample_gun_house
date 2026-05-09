/**
 * Sahibzada Gun House — Shared Camera Module
 * Handles document capture, compression, and local storage.
 */

const CameraModule = {
  stream: null,
  capturedImages: [],
  MAX_IMAGES: 6,
  MIN_IMAGES: 2,
  MAX_SIZE_KB: 500,
  onComplete: null,

  init(onCompleteCallback) {
    this.onComplete = onCompleteCallback;
    this.capturedImages = JSON.parse(localStorage.getItem('sgh_captured_docs') || '[]');
  },

  async openModal() {
    const modal = document.getElementById('camera-modal-shared');
    if (!modal) {
      this.createModal();
    }
    document.getElementById('camera-modal-shared').style.display = 'flex';
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      document.getElementById('shared-video').srcObject = this.stream;
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Please ensure you have given permission.");
      this.closeModal();
    }
  },

  closeModal() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    const modal = document.getElementById('camera-modal-shared');
    if (modal) modal.style.display = 'none';
    if (this.onComplete) this.onComplete(this.capturedImages);
  },

  capture() {
    if (this.capturedImages.length >= this.MAX_IMAGES) return;

    const video = document.getElementById('shared-video');
    const canvas = document.getElementById('shared-canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    let quality = 0.9;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);
    
    while ((dataUrl.length * 0.75) / 1024 > this.MAX_SIZE_KB && quality > 0.1) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    this.capturedImages.push(dataUrl);
    localStorage.setItem('sgh_captured_docs', JSON.stringify(this.capturedImages));
    this.updateUI();
  },

  updateUI() {
    const countEl = document.getElementById('shared-capture-count');
    const doneBtn = document.getElementById('shared-camera-done-btn');
    if (countEl) {
      countEl.textContent = `Images captured: ${this.capturedImages.length} / ${this.MAX_IMAGES} ${this.capturedImages.length < this.MIN_IMAGES ? '(Min 2 required: Aadhaar + License)' : ''}`;
    }
    if (doneBtn) {
      doneBtn.style.display = this.capturedImages.length >= this.MIN_IMAGES ? 'flex' : 'none';
    }
  },

  createModal() {
    const modalHtml = `
      <div id="camera-modal-shared" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:2000; flex-direction:column; align-items:center; justify-content:center; padding:1rem;">
        <div style="background:white; width:100%; max-width:600px; border-radius:8px; overflow:hidden; position:relative;">
          <div style="padding:1rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee;">
            <h3 style="margin:0; font-family:'Playfair Display', serif;">Capture Aadhaar & License</h3>
            <button onclick="CameraModule.closeModal()" style="font-size:1.5rem; line-height:1; background:none; border:none; cursor:pointer;">&times;</button>
          </div>
          <div style="position:relative; background:#000; aspect-ratio:4/3; display:flex; align-items:center; justify-content:center;">
            <video id="shared-video" autoplay playsinline style="width:100%; height:100%; object-fit:cover;"></video>
            <canvas id="shared-canvas" style="display:none;"></canvas>
          </div>
          <div style="padding:1.5rem; text-align:center;">
            <p id="shared-capture-count" style="font-size:0.875rem; margin-bottom:1rem; color:#666;">Images captured: 0 / 6 (Min 2 required)</p>
            <div style="display:flex; justify-content:center; gap:2rem; align-items:center;">
              <button onclick="CameraModule.capture()" style="background:#064e3b; color:white; border-radius:50%; width:60px; height:60px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button id="shared-camera-done-btn" onclick="CameraModule.closeModal()" style="display:none; background:#d4af37; color:#022c22; padding:0.6rem 1.5rem; border-radius:20px; font-weight:700; border:none; cursor:pointer; align-items:center; gap:0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);
  },

  isVerified() {
    const docs = JSON.parse(localStorage.getItem('sgh_captured_docs') || '[]');
    return docs.length >= this.MIN_IMAGES;
  }
};
