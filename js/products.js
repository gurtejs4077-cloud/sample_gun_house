// SVG illustrations for product categories
const SVG_PISTOL_GOLD = `<svg class="product-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dcb43c"/>
      <stop offset="50%" style="stop-color:#d4af37"/>
      <stop offset="100%" style="stop-color:#94731a"/>
    </linearGradient>
  </defs>
  <rect x="20" y="60" width="140" height="22" rx="2" fill="url(#gold1)" stroke="#634c1d" stroke-width="0.8"/>
  <rect x="30" y="62" width="120" height="3" fill="#634c1d" opacity="0.3"/>
  <path d="M 35 82 L 145 82 L 140 110 L 100 110 L 95 130 L 75 130 L 70 105 L 40 105 Z" fill="url(#gold1)" stroke="#634c1d" stroke-width="0.8"/>
  <rect x="78" y="100" width="20" height="35" rx="2" fill="#3a2b0e"/>
  <ellipse cx="58" cy="98" rx="10" ry="7" fill="none" stroke="#634c1d" stroke-width="2"/>
  <rect x="155" y="65" width="10" height="12" fill="url(#gold1)" stroke="#634c1d" stroke-width="0.5"/>
</svg>`;

const SVG_REVOLVER = `<svg class="product-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="silver1">
      <stop offset="0%" style="stop-color:#e8e8e8"/>
      <stop offset="100%" style="stop-color:#888"/>
    </radialGradient>
  </defs>
  <rect x="100" y="65" width="60" height="14" rx="2" fill="url(#silver1)" stroke="#444" stroke-width="0.5"/>
  <circle cx="85" cy="78" r="22" fill="url(#silver1)" stroke="#444" stroke-width="1"/>
  <circle cx="85" cy="78" r="4" fill="#222"/>
  <rect x="55" y="72" width="35" height="14" fill="url(#silver1)" stroke="#444" stroke-width="0.5"/>
  <path d="M 60 86 L 80 86 L 78 130 Q 70 135 62 130 Z" fill="#5a3520" stroke="#3a2010" stroke-width="0.8"/>
</svg>`;

const SVG_HOLSTER = `<svg class="product-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leather1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#3a2b1a"/>
      <stop offset="100%" style="stop-color:#1a1208"/>
    </linearGradient>
  </defs>
  <path d="M 70 30 L 130 30 L 135 110 Q 130 130 100 130 Q 70 130 65 110 Z" fill="url(#leather1)" stroke="#0a0604" stroke-width="1"/>
  <rect x="85" y="20" width="30" height="15" rx="2" fill="url(#leather1)" stroke="#0a0604" stroke-width="0.8"/>
</svg>`;

const SVG_OPTIC = `<svg class="product-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="lens1">
      <stop offset="0%" style="stop-color:#d4af37" stop-opacity="0.3"/>
      <stop offset="50%" style="stop-color:#064e3b"/>
      <stop offset="100%" style="stop-color:#022c22"/>
    </radialGradient>
  </defs>
  <rect x="40" y="55" width="120" height="50" rx="6" fill="#1a1a1a" stroke="#0a0a0a" stroke-width="1"/>
  <circle cx="50" cy="80" r="20" fill="url(#lens1)" stroke="#0a0a0a" stroke-width="2"/>
  <circle cx="150" cy="80" r="18" fill="url(#lens1)" stroke="#0a0a0a" stroke-width="2"/>
</svg>`;

const SVG_RIFLE = `<svg class="product-svg" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wood1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#8b4513"/>
      <stop offset="100%" style="stop-color:#5d2f0a"/>
    </linearGradient>
  </defs>
  <path d="M 10 50 L 70 45 L 70 65 L 30 75 Z" fill="url(#wood1)" stroke="#3d1f08" stroke-width="0.8"/>
  <rect x="65" y="42" width="40" height="20" fill="#2a2a2a" stroke="#0a0a0a" stroke-width="0.5"/>
  <rect x="100" y="48" width="80" height="6" fill="#444" stroke="#222" stroke-width="0.5"/>
</svg>`;

const SVG_CLEANING = `<svg class="product-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="40" width="160" height="80" rx="4" fill="#1a3d2e" stroke="#022c22" stroke-width="1"/>
  <line x1="60" y1="40" x2="60" y2="120" stroke="#0a2e1f" stroke-width="1"/>
  <rect x="115" y="55" width="14" height="35" rx="2" fill="#dcb43c" stroke="#94731a"/>
</svg>`;

const SVG_AMMO = `<svg class="product-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brass1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#b8941f"/>
      <stop offset="50%" style="stop-color:#dcb43c"/>
      <stop offset="100%" style="stop-color:#b8941f"/>
    </linearGradient>
  </defs>
  <g transform="translate(40,30)">
    <rect x="0" y="20" width="20" height="60" fill="url(#brass1)" stroke="#634c1d" stroke-width="0.5"/>
    <path d="M 0 20 L 20 20 L 17 5 L 10 0 L 3 5 Z" fill="#888" stroke="#444" stroke-width="0.5"/>
  </g>
</svg>`;

// Categories
const CATEGORIES = [
  { slug: 'pistols',      name: 'Pistols' },
  { slug: 'revolvers',    name: 'Revolvers' },
  { slug: 'air-rifles',   name: 'Air Rifles' },
  { slug: 'ammunition',   name: 'Ammunition' },
  { slug: 'holsters',     name: 'Holsters & Carry' },
  { slug: 'optics',       name: 'Optics & Sights' },
  { slug: 'cleaning',     name: 'Cleaning & Care' },
];

// Brands
const BRANDS = [
  { slug: 'kiehberg',  name: 'Kiehberg GmbH', authorized: true },
  { slug: 'beretta',   name: 'Beretta',       authorized: true },
  { slug: 'girsan',    name: 'Girsan',        authorized: true },
  { slug: 'alfaproj',  name: 'Alfaproj',      authorized: true },
  { slug: 'vortex',    name: 'Vortex',        authorized: false },
];

// PRODUCTS
const PRODUCTS = [
  {
    id: 'kie-1911-chr',
    slug: 'kiehberg-1911-chrome',
    name: 'Kiehberg 1911 Chrome Edition',
    shortDesc: 'Engraved chrome 1911 in .45 ACP — limited dealer allocation.',
    licenseRequired: true,
    licenseType: 'Form III · Non-Prohibited Bore',
    priceInr: 28500000,
    caliber: '.45 ACP',
    capacity: '8+1',
    category: 'pistols',
    brand: 'kiehberg',
    isFeatured: true,
    image: SVG_PISTOL_GOLD,
    createdAt: 6,
  },
  {
    id: 'kie-1911-sc',
    slug: 'kiehberg-1911-subcompact',
    name: 'Kiehberg 1911 Sub-Compact',
    shortDesc: 'Concealable Officer-frame 1911 with tritium night sights.',
    licenseRequired: true,
    licenseType: 'Form III · Non-Prohibited Bore',
    priceInr: 24500000,
    caliber: '.45 ACP',
    capacity: '7+1',
    category: 'pistols',
    brand: 'kiehberg',
    isFeatured: true,
    image: SVG_PISTOL_GOLD,
    createdAt: 5,
  },
  {
    id: 'ber-92fs',
    slug: 'beretta-92fs',
    name: 'Beretta 92FS',
    shortDesc: 'The legendary service pistol in 9×19mm.',
    licenseRequired: true,
    licenseType: 'Form III · Non-Prohibited Bore',
    priceInr: 19500000,
    caliber: '9×19mm',
    capacity: '15+1',
    category: 'pistols',
    brand: 'beretta',
    isFeatured: true,
    image: SVG_PISTOL_GOLD,
    createdAt: 4,
  },
  {
    id: 'gir-mc28',
    slug: 'girsan-mc28-sa',
    name: 'Girsan MC 28 SA',
    shortDesc: 'Modern striker-fired service pistol from Turkey.',
    licenseRequired: true,
    licenseType: 'Form III · Non-Prohibited Bore',
    priceInr: 16500000,
    caliber: '9×19mm',
    capacity: '15+1',
    category: 'pistols',
    brand: 'girsan',
    isFeatured: false,
    image: SVG_PISTOL_GOLD,
    createdAt: 3,
  },
  {
    id: 'alf-820',
    slug: 'alfaproj-alfa-820',
    name: 'Alfaproj Alfa 820 Revolver',
    shortDesc: '.38 Special revolver — Czech engineering.',
    licenseRequired: true,
    licenseType: 'Form III · Non-Prohibited Bore',
    priceInr: 14500000,
    caliber: '.38 Special',
    capacity: '6 rounds',
    category: 'revolvers',
    brand: 'alfaproj',
    isFeatured: true,
    image: SVG_REVOLVER,
    createdAt: 6,
  },
  {
    id: 'alf-820pd',
    slug: 'alfaproj-alfa-820-pd',
    name: 'Alfaproj Alfa 820 PD',
    shortDesc: 'Compact carry revolver with bobbed hammer.',
    licenseRequired: true,
    licenseType: 'Form III · Non-Prohibited Bore',
    priceInr: 13500000,
    caliber: '.38 Special',
    capacity: '5 rounds',
    category: 'revolvers',
    brand: 'alfaproj',
    isFeatured: false,
    image: SVG_REVOLVER,
    createdAt: 2,
  },
  {
    id: 'alf-air-622',
    slug: 'alfaproj-alfa-air-622',
    name: 'Alfaproj Alfa Air 622',
    shortDesc: 'PCP air rifle — match-grade accuracy.',
    licenseRequired: false,
    priceInr: 4500000,
    caliber: '.177',
    capacity: '10 rounds',
    category: 'air-rifles',
    brand: 'alfaproj',
    isFeatured: false,
    image: SVG_RIFLE,
    createdAt: 4,
  },
  {
    id: 'acc-hlst-iwb-1911',
    slug: 'kydex-iwb-holster-1911',
    name: 'Custom Kydex IWB Holster — 1911',
    shortDesc: 'Custom-molded inside-the-waistband carry holster.',
    licenseRequired: false,
    priceInr: 450000,
    category: 'holsters',
    isFeatured: true,
    image: SVG_HOLSTER,
    createdAt: 5,
    inStock: true,
  },
  {
    id: 'acc-hlst-owb-92fs',
    slug: 'leather-owb-holster-beretta-92fs',
    name: 'Premium Leather OWB Holster — Beretta 92FS',
    shortDesc: 'Hand-stitched belt holster in Italian saddle leather.',
    licenseRequired: false,
    priceInr: 680000,
    compareAtInr: 850000,
    category: 'holsters',
    isFeatured: false,
    image: SVG_HOLSTER,
    createdAt: 3,
    inStock: true,
  },
  {
    id: 'opt-vtx-cf-rd',
    slug: 'vortex-crossfire-red-dot',
    name: 'Vortex Crossfire Red Dot',
    shortDesc: '2 MOA red dot — pistol-rated, IPX7 waterproof.',
    licenseRequired: false,
    priceInr: 1850000,
    category: 'optics',
    brand: 'vortex',
    isFeatured: true,
    image: SVG_OPTIC,
    createdAt: 4,
    inStock: true,
  },
  {
    id: 'opt-vtx-vp-30mm',
    slug: 'vortex-viper-pst-30mm',
    name: 'Vortex Viper PST Gen II 1-6×24',
    shortDesc: 'Variable-power LPVO scope for sport shooting.',
    licenseRequired: false,
    priceInr: 5800000,
    category: 'optics',
    brand: 'vortex',
    isFeatured: false,
    image: SVG_OPTIC,
    createdAt: 2,
    inStock: false,
  },
  {
    id: 'acc-cln-pro',
    slug: 'premium-cleaning-kit',
    name: 'Premium Cleaning Kit — Universal',
    shortDesc: 'Full bore-cleaning kit with brass rods and patches.',
    licenseRequired: false,
    priceInr: 320000,
    category: 'cleaning',
    isFeatured: false,
    image: SVG_CLEANING,
    createdAt: 5,
    inStock: true,
  },
  {
    id: 'acc-cln-bsc',
    slug: 'basic-field-cleaning-kit',
    name: 'Basic Field Cleaning Kit',
    shortDesc: 'Compact kit for range maintenance.',
    licenseRequired: false,
    priceInr: 95000,
    category: 'cleaning',
    isFeatured: false,
    image: SVG_CLEANING,
    createdAt: 1,
    inStock: true,
  },
  {
    id: 'amm-45acp-fmj',
    slug: '45acp-fmj-50ct',
    name: '.45 ACP FMJ 230gr — Box of 50',
    shortDesc: 'Full metal jacket range ammunition.',
    licenseRequired: true,
    licenseType: 'Buyer Form III + UIN required',
    priceInr: 850000,
    caliber: '.45 ACP',
    category: 'ammunition',
    isFeatured: false,
    image: SVG_AMMO,
    createdAt: 3,
  },
  {
    id: 'amm-9mm-fmj',
    slug: '9mm-fmj-50ct',
    name: '9×19mm FMJ 124gr — Box of 50',
    shortDesc: 'Standard NATO ball ammunition.',
    licenseRequired: true,
    licenseType: 'Buyer Form III + UIN required',
    priceInr: 650000,
    caliber: '9×19mm',
    category: 'ammunition',
    isFeatured: false,
    image: SVG_AMMO,
    createdAt: 3,
  },
  {
    id: 'amm-pellet-177',
    slug: 'air-pellets-177-tin',
    name: '.177 Air Pellets — Tin of 500',
    shortDesc: 'Match-grade lead pellets for sport shooting.',
    licenseRequired: false,
    priceInr: 65000,
    caliber: '.177',
    category: 'ammunition',
    isFeatured: false,
    image: SVG_AMMO,
    createdAt: 1,
    inStock: true,
  },
];
