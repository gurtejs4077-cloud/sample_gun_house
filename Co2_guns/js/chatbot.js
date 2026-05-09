/**
 * Sahibzada Gun House — CO2 Division Support Agent
 */

(function () {
  'use strict';

  const RULES = [
    {
      patterns: [/\b(hi|hello|hey|good (morning|afternoon|evening)|namaste|sat sri akal)\b/i],
      response: () => `Welcome to the CO2 & Air Guns Division! 🎯<br>How can I assist you with precision equipment today?<br><br>
        <span class="chat-quick-replies">
          <button onclick="chatbotQuickReply('Store hours')">🕐 Store Hours</button>
          <button onclick="chatbotQuickReply('Air gun rules')">📋 Regulation</button>
          <button onclick="chatbotQuickReply('What brands do you carry')">🔫 Brands</button>
          <button onclick="chatbotQuickReply('How to contact you')">📞 Contact</button>
        </span>`
    },
    {
      patterns: [/\b(hour|timing|open|close|when|schedule|time)\b/i],
      response: `<strong>🕐 Store Hours</strong><br>
        Monday – Saturday: <strong>10:30 AM – 8:00 PM</strong><br>
        Sunday: <strong>Closed</strong>`
    },
    {
      patterns: [/\b(where|location|address|directions|showroom|visit|mohali|sector)\b/i],
      response: `<strong>📍 Our Showroom</strong><br>
        SHOP NO. 126, FF, MPQ8+9GG, opp. Gurukul World School<br>
        Sector 69, Sahibzada Ajit Singh Nagar, Chandigarh, Punjab 160062<br><br>
        <a href="https://maps.google.com/?q=Sahibzada+Gun+House" target="_blank" style="color:var(--accent);">View on Google Maps ↗</a>`
    },
    {
      patterns: [/\b(contact|call|phone|number|whatsapp|email|reach|support)\b/i],
      response: `<strong>📞 Contact Us</strong><br>
        Phone / WhatsApp: <strong>+91 9653 001 001</strong><br>
        Email: <strong>co2.division@sahibzadagunhouse.com</strong>`
    },
    {
      patterns: [/\b(licen[sc]e|licen[sc]ing|permit|arms act|arms rule|legal|form.?iii|form.?3|uin|uid|regulation|rule)\b/i],
      response: `<strong>📋 CO2 & Air Gun Regulation</strong><br>
        Most air guns below 20 Joules do not require a license in India, but age verification (18+) is mandatory.<br><br>
        <a href="licensing.html" style="color:var(--accent);">📖 View Regulation Guide ↗</a>`
    },
    {
      patterns: [/\b(brand|make|manufactur|umarex|gamo|crosman|sig sauer|walther|diana)\b/i],
      response: `<strong>🔫 Elite Brands</strong><br>
        We stock Umarex, Gamo, Crosman, Sig Sauer (Air), and more.<br><br>
        <a href="brands.html" style="color:var(--accent);">🌐 View All Brands ↗</a>`
    },
    {
      patterns: [/\b(product|catalogue|catalog|pistol|rifle|pellet|bb|canister|co2|accessory)\b/i],
      response: `<strong>🛒 CO2 Collection</strong><br>
        Browse our full range of precision air equipment:<br><br>
        <a href="products.html" style="color:var(--accent);">Browse Inventory ↗</a>`
    },
    {
      patterns: [/\b(thank|thanks|bye|goodbye|ok|okay|great|perfect|got it|understood)\b/i],
      response: `You're welcome! 😊<br>Shoot safely and accurately!`
    },
  ];

  const FALLBACK = `I'm sorry, I didn't quite understand that. 🤔<br>
    Try asking about <strong>Hours</strong>, <strong>Regulation</strong>, <strong>Brands</strong>, or <strong>Inventory</strong>.<br>
    Or call us at <strong>+91 9653 001 001</strong>`;

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

  function injectWidget() {
    // Add CSS for chatbot to head if not present
    if (!document.getElementById('sgh-chatbot-style')) {
      const style = document.createElement('style');
      style.id = 'sgh-chatbot-style';
      style.textContent = `
        #sgh-chatbot-wrapper { position: fixed; bottom: 120px; right: 40px; z-index: 1000; }
        #sgh-chat-toggle { width: 60px; height: 60px; border-radius: 50%; background: var(--accent); color: var(--primary); border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
        #sgh-chat-window { position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px; background: var(--primary-light); border: 1px solid var(--glass-border); border-radius: 16px; display: none; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        #sgh-chat-window.active { display: flex; }
        #sgh-chat-header { padding: 1.5rem; background: var(--primary); border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; }
        #sgh-chat-messages { flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .sgh-msg { max-width: 80%; padding: 0.8rem 1rem; border-radius: 12px; font-size: 0.9rem; }
        .sgh-msg-bot { align-self: flex-start; background: var(--glass); border: 1px solid var(--glass-border); color: var(--white); }
        .sgh-msg-user { align-self: flex-end; background: var(--accent); color: var(--primary); font-weight: 500; }
        #sgh-chat-input-row { padding: 1rem; background: var(--primary); border-top: 1px solid var(--glass-border); display: flex; gap: 0.5rem; }
        #sgh-chat-input { flex: 1; background: var(--glass); border: 1px solid var(--glass-border); color: var(--white); padding: 0.6rem; border-radius: 6px; outline: none; }
        #sgh-chat-send { background: var(--accent); border: none; padding: 0.6rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .chat-quick-replies { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
        .chat-quick-replies button { background: var(--glass); border: 1px solid var(--accent); color: var(--accent); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
      `;
      document.head.appendChild(style);
    }

    const html = `
      <div id="sgh-chatbot-wrapper">
        <button id="sgh-chat-toggle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <div id="sgh-chat-window">
          <div id="sgh-chat-header">
            <strong style="color: var(--accent);">CO2 Support</strong>
            <button onclick="document.getElementById('sgh-chat-window').classList.remove('active')" style="background:none; border:none; color:var(--silver); cursor:pointer;">✕</button>
          </div>
          <div id="sgh-chat-messages"></div>
          <div id="sgh-chat-input-row">
            <input type="text" id="sgh-chat-input" placeholder="Type a message...">
            <button id="sgh-chat-send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    bindEvents();
    appendMessage("Hello! 👋 I'm your CO2 & Air Gun specialist. How can I help you today?", 'bot');
  }

  function appendMessage(content, sender) {
    const container = document.getElementById('sgh-chat-messages');
    const msg = document.createElement('div');
    msg.className = `sgh-msg sgh-msg-${sender}`;
    msg.innerHTML = content;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function sendMessage() {
    const input = document.getElementById('sgh-chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    appendMessage(msg, 'user');
    input.value = '';
    setTimeout(() => appendMessage(getResponse(msg), 'bot'), 600);
  }

  window.chatbotQuickReply = (text) => {
    document.getElementById('sgh-chat-input').value = text;
    sendMessage();
  };

  function bindEvents() {
    document.getElementById('sgh-chat-toggle').addEventListener('click', () => {
      document.getElementById('sgh-chat-window').classList.toggle('active');
    });
    document.getElementById('sgh-chat-send').addEventListener('click', sendMessage);
    document.getElementById('sgh-chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }
})();
