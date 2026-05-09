/**
 * Sahibzada Gun House — Rule-Based Customer Support Agent
 * Provides instant answers about products, licensing, hours, and more.
 */

(function () {
  'use strict';

  /* ============================================================
     KNOWLEDGE BASE — Rule definitions
     Each rule has: patterns (regex), response (string | fn)
     ============================================================ */
  const RULES = [
    // Greetings
    {
      patterns: [/\b(hi|hello|hey|good (morning|afternoon|evening)|namaste|sat sri akal)\b/i],
      response: () => `Welcome to Sahibzada Gun House! 🎯<br>How can I assist you today?<br><br>
        <span class="chat-quick-replies">
          <button onclick="chatbotQuickReply('Store hours')">🕐 Store Hours</button>
          <button onclick="chatbotQuickReply('How to get a gun license')">📋 Licensing</button>
          <button onclick="chatbotQuickReply('What brands do you carry')">🔫 Brands</button>
          <button onclick="chatbotQuickReply('How to contact you')">📞 Contact</button>
        </span>`
    },

    // Store hours
    {
      patterns: [/\b(hour|timing|open|close|when|schedule|time)\b/i],
      response: `<strong>🕐 Store Hours</strong><br>
        Monday – Saturday: <strong>10:30 AM – 8:00 PM</strong><br>
        Sunday: <strong>Closed</strong><br><br>
        We recommend calling ahead for large purchases or licensing consultations.`
    },

    // Location / address
    {
      patterns: [/\b(where|location|address|directions|showroom|visit|mohali|sector)\b/i],
      response: `<strong>📍 Our Showroom</strong><br>
        SHOP NO. 126, FF, MPQ8+9GG, opp. Gurukul World School<br>
        Sector 69, Sahibzada Ajit Singh Nagar, Chandigarh, Punjab 160062<br><br>
        <a href="https://maps.google.com/?q=Sahibzada+Gun+House" target="_blank" style="color:var(--gold-400);">View on Google Maps ↗</a>`
    },

    // Contact / phone / email
    {
      patterns: [/\b(contact|call|phone|number|whatsapp|email|reach|support)\b/i],
      response: `<strong>📞 Contact Us</strong><br>
        Phone / WhatsApp: <strong>+91 9653 001 001</strong><br>
        Email: <strong>sales@sahibzadagunhouse.com</strong><br><br>
        Or tap the <span style="color:#25d366;">WhatsApp</span> button below to chat directly!`
    },

    // Licensing — general
    {
      patterns: [/\b(licen[sc]e|licen[sc]ing|permit|arms act|arms rule|legal|form.?iii|form.?3|uin|uid)\b/i],
      response: `<strong>📋 Firearms Licensing in India</strong><br>
        We operate under the <em>Arms Act 1959</em> & <em>Arms Rules 2016</em>.<br><br>
        <strong>Key requirements:</strong><br>
        • Valid Form III arms license<br>
        • Unique Identification Number (UIN)<br>
        • In-store physical verification for licensed items<br><br>
        <a href="/licensing.html" style="color:var(--gold-400);">📖 Full Licensing Guide ↗</a>`
    },

    // Brands / manufacturers
    {
      patterns: [/\b(brand|make|manufactur|beretta|kiehberg|girsan|alfaproj|german|import)\b/i],
      response: `<strong>🔫 Authorized Brands</strong><br>
        We are an authorized dealer for:<br><br>
        • <strong>Kiehberg GmbH</strong> — Germany<br>
        • <strong>Beretta</strong> — Italy<br>
        • <strong>Girsan</strong> — Turkey<br>
        • <strong>Alfaproj</strong> — Czech Republic<br><br>
        <a href="/brands.html" style="color:var(--gold-400);">🌐 View All Brands ↗</a>`
    },

    // Products / catalogue
    {
      patterns: [/\b(product|catalogue|catalog|pistol|revolver|rifle|air.?rifle|airgun|ammunition|ammo|holster|optic|accessory|accessories|scope|silencer)\b/i],
      response: `<strong>🛒 Our Product Range</strong><br>
        We stock:<br><br>
        • <strong>Pistols & Revolvers</strong> (license required)<br>
        • <strong>Air Rifles & Airguns</strong><br>
        • <strong>Optics & Scopes</strong><br>
        • <strong>Holsters & Accessories</strong><br>
        • <strong>Ammunition</strong><br><br>
        <a href="/#shop" style="color:var(--gold-400);">Browse Firearms & Ammunition ↗</a>`
    },

    // Price / cost
    {
      patterns: [/\b(price|cost|rate|how much|budget|cheap|expensive|afford)\b/i],
      response: `<strong>💰 Pricing</strong><br>
        Prices vary by product and are listed in our online store.<br><br>
        For custom quotes or bulk orders, please contact us directly:<br>
        📞 <strong>+91 9653 001 001</strong><br><br>
        <a href="/#shop" style="color:var(--gold-400);">View Prices ↗</a>`
    },

    {
      patterns: [/\b(order|buy|purchase|reserve|reservation|cart|checkout|pay|booking)\b/i],
      response: `<strong>🛒 How to Purchase</strong><br>
        All items in our inventory, including firearms and ammunition, require a valid <strong>Form III Arms License</strong> and <strong>UIN</strong>.<br><br>
        1. Reserve your items online.<br>
        2. Visit our showroom for physical license verification.<br>
        3. Complete your purchase in-person.<br><br>
        <a href="/#shop" style="color:var(--gold-400);">Start Shopping ↗</a>`
    },

    // Return / refund / exchange
    {
      patterns: [/\b(return|refund|exchange|warranty|guarantee|broken|defect)\b/i],
      response: `<strong>↩️ Returns & Warranty</strong><br>
        All products come with manufacturer warranty.<br><br>
        For returns, exchanges, or warranty claims, please visit our store with your purchase receipt, or contact us:<br>
        📞 <strong>+91 9653 001 001</strong>`
    },

    {
      patterns: [/\b(deliver|shipping|ship|dispatch|courier|home.?deliver)\b/i],
      response: `<strong>🚚 Delivery Policy</strong><br>
        Per <em>Arms Rules 2016</em>, all firearms and ammunition must be collected in-person at our Mohali showroom after physical license verification. <strong>Home delivery is not permitted by law for these items.</strong>`
    },

    // Careers / jobs
    {
      patterns: [/\b(job|career|hire|hiring|vacancy|employ|intern|work with)\b/i],
      response: `<strong>💼 Careers</strong><br>
        Interested in joining our team? Send your CV to:<br>
        📧 <strong>sales@sahibzadagunhouse.com</strong><br><br>
        Include the role you're applying for in the subject line.`
    },

    // Repairs / service
    {
      patterns: [/\b(repair|service|fix|clean|maintain|maintenance|gunsmith)\b/i],
      response: `<strong>🔧 Servicing & Repairs</strong><br>
        We offer professional gunsmithing and maintenance services for firearms purchased from us.<br><br>
        Please visit our showroom or call to schedule an appointment:<br>
        📞 <strong>+91 9653 001 001</strong>`
    },

    // Thanks / bye
    {
      patterns: [/\b(thank|thanks|bye|goodbye|ok|okay|great|perfect|got it|understood)\b/i],
      response: `You're welcome! 😊<br>
        If you have any more questions, feel free to ask. We're happy to help!<br><br>
        Visit us at Sector 61, Mohali — Mon to Sat, 10:30 AM – 8:00 PM.`
    },
  ];

  /* ============================================================
     Fallback response
     ============================================================ */
  const FALLBACK = `I'm sorry, I didn't quite understand that. 🤔<br>
    Here are some things I can help with:<br><br>
    <span class="chat-quick-replies">
      <button onclick="chatbotQuickReply('Store hours')">🕐 Store Hours</button>
      <button onclick="chatbotQuickReply('How to get a gun license')">📋 Licensing</button>
      <button onclick="chatbotQuickReply('What brands do you carry')">🔫 Brands</button>
      <button onclick="chatbotQuickReply('How to contact you')">📞 Contact</button>
    </span>
    Or call us at <strong>+91 9653 001 001</strong>`;

  /* ============================================================
     DOM Helper
     ============================================================ */
  function getResponse(message) {
    const msg = message.trim().toLowerCase();
    for (const rule of RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(msg)) {
          return typeof rule.response === 'function' ? rule.response() : rule.response;
        }
      }
    }
    return FALLBACK;
  }

  /* ============================================================
     Widget HTML injection
     ============================================================ */
  function injectWidget() {
    const html = `
      <!-- AI Chatbot Widget -->
      <div id="sgh-chatbot-wrapper">
        <!-- Toggle Button -->
        <button id="sgh-chat-toggle" aria-label="Open Customer Support Chat" title="Ask us anything">
          <span id="sgh-chat-icon-open">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span class="chat-badge-dot" id="sgh-badge-dot"></span>
          </span>
          <span id="sgh-chat-icon-close" style="display:none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        </button>

        <!-- Chat Window -->
        <div id="sgh-chat-window" aria-live="polite">
          <!-- Header -->
          <div id="sgh-chat-header">
            <div id="sgh-chat-header-info">
              <div id="sgh-chat-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <strong>SGH Support</strong>
                <span>Rule-Based AI · Instant Answers</span>
              </div>
            </div>
            <button id="sgh-chat-close-btn" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div id="sgh-chat-messages"></div>

          <!-- Input -->
          <div id="sgh-chat-input-row">
            <input
              type="text"
              id="sgh-chat-input"
              placeholder="Ask about products, licensing, hours…"
              autocomplete="off"
              maxlength="200"
            />
            <button id="sgh-chat-send" aria-label="Send message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    bindEvents();
    // Show welcome message after short delay
    setTimeout(showWelcome, 800);
  }

  /* ============================================================
     Message rendering
     ============================================================ */
  function appendMessage(content, sender) {
    const container = document.getElementById('sgh-chat-messages');
    const wrapper = document.createElement('div');
    wrapper.className = `sgh-msg sgh-msg-${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'sgh-bubble';
    bubble.innerHTML = content;

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById('sgh-chat-messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'sgh-msg sgh-msg-bot';
    wrapper.id = 'sgh-typing-indicator';

    wrapper.innerHTML = `
      <div class="sgh-bubble sgh-typing">
        <span></span><span></span><span></span>
      </div>`;
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('sgh-typing-indicator');
    if (el) el.remove();
  }

  function showWelcome() {
    appendMessage(
      `Hello! 👋 I'm the <strong>SGH Support Agent</strong>.<br>
      Ask me anything about our products, licensing, store hours, or how to reach us!`,
      'bot'
    );
    // Show badge dot
    const dot = document.getElementById('sgh-badge-dot');
    if (dot) dot.style.display = 'block';
  }

  /* ============================================================
     Send message logic
     ============================================================ */
  function sendMessage() {
    const input = document.getElementById('sgh-chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(msg, 'user');
    input.value = '';

    showTyping();
    setTimeout(() => {
      hideTyping();
      const reply = getResponse(msg);
      appendMessage(reply, 'bot');
    }, 600 + Math.random() * 400);
  }

  /* ============================================================
     Quick reply handler (global so inline onclick works)
     ============================================================ */
  window.chatbotQuickReply = function (text) {
    const input = document.getElementById('sgh-chat-input');
    if (input) {
      input.value = text;
      sendMessage();
    }
  };

  /* ============================================================
     Toggle chat window
     ============================================================ */
  function toggleChat() {
    const win = document.getElementById('sgh-chat-window');
    const iconOpen = document.getElementById('sgh-chat-icon-open');
    const iconClose = document.getElementById('sgh-chat-icon-close');
    const dot = document.getElementById('sgh-badge-dot');
    const isOpen = win.classList.contains('active');

    if (isOpen) {
      win.classList.remove('active');
      iconOpen.style.display = 'flex';
      iconClose.style.display = 'none';
    } else {
      win.classList.add('active');
      iconOpen.style.display = 'none';
      iconClose.style.display = 'flex';
      if (dot) dot.style.display = 'none';
      document.getElementById('sgh-chat-input').focus();
    }
  }

  /* ============================================================
     Event bindings
     ============================================================ */
  function bindEvents() {
    document.getElementById('sgh-chat-toggle').addEventListener('click', toggleChat);
    document.getElementById('sgh-chat-close-btn').addEventListener('click', toggleChat);

    const sendBtn = document.getElementById('sgh-chat-send');
    sendBtn.addEventListener('click', sendMessage);

    document.getElementById('sgh-chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  /* ============================================================
     Init
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }
})();
