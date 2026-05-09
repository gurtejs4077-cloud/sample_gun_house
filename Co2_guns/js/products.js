// SVG illustrations for CO2 products
const SVG_CO2_PISTOL = `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
  <path d="M40 80 L160 80 L155 95 L45 95 Z" fill="#334155" />
  <path d="M45 40 L150 45 L150 65 L45 70 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
  <rect x="50" y="70" width="30" height="40" rx="4" fill="#0f172a" />
</svg>`;

const PRODUCTS = [
  {
    id: 'co2-uma-m92',
    name: 'Umarex Beretta M92 FS',
    shortDesc: 'Highly accurate CO2 replica of the classic Beretta 92. Features a rifled barrel and 8-shot rotary magazine.',
    priceInr: 4500000,
    category: 'co2-guns',
    brand: 'umarex',
    isFeatured: true,
    image: SVG_CO2_PISTOL
  },
  {
    id: 'co2-sig-p320',
    name: 'Sig Sauer P320 M17 CO2',
    shortDesc: 'Full blowback action, 20-round belt-fed magazine. Authentic weight and feel of the US Army service pistol.',
    priceInr: 5200000,
    category: 'co2-guns',
    brand: 'sig-sauer',
    isFeatured: true,
    image: SVG_CO2_PISTOL
  },
  {
    id: 'co2-wal-ppq',
    name: 'Walther PPQ M2 CO2',
    shortDesc: 'Precision engineered for target shooting. Exceptional trigger pull and ergonomic grip design.',
    priceInr: 3800000,
    category: 'co2-guns',
    brand: 'walther',
    isFeatured: true,
    image: SVG_CO2_PISTOL
  },
  {
    id: 'air-gam-whisper',
    name: 'Gamo Whisper Fusion Mach 1',
    shortDesc: 'High-power air rifle with noise dampening technology. Perfect for long-range precision practice.',
    priceInr: 6500000,
    category: 'air-rifles',
    brand: 'gamo',
    isFeatured: true,
    image: SVG_CO2_PISTOL
  },
  {
    id: 'co2-cro-357',
    name: 'Crosman Vigilante Revolver',
    shortDesc: 'Versatile CO2 revolver capable of firing both pellets and BBs. Includes accessory rails.',
    priceInr: 2500000,
    category: 'co2-guns',
    brand: 'crosman',
    isFeatured: false,
    image: SVG_CO2_PISTOL
  },
  {
    id: 'co2-acc-canister',
    name: 'Premium CO2 Canisters (12g)',
    shortDesc: 'Pack of 10 high-purity CO2 canisters for consistent muzzle velocity and valve protection.',
    priceInr: 120000,
    category: 'accessories',
    brand: 'umarex',
    isFeatured: false,
    image: SVG_CO2_PISTOL
  }
];

const CATEGORIES = [
  { slug: 'co2-guns', name: 'CO2 Pistols' },
  { slug: 'air-rifles', name: 'Air Rifles' },
  { slug: 'accessories', name: 'Accessories' }
];

const BRANDS = [
  { slug: 'umarex', name: 'Umarex' },
  { slug: 'sig-sauer', name: 'Sig Sauer' },
  { slug: 'walther', name: 'Walther' },
  { slug: 'gamo', name: 'Gamo' },
  { slug: 'crosman', name: 'Crosman' }
];
