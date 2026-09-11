// Realistic Seed Data for Multi-Vendor E-Commerce Platform

export const INITIAL_CATEGORIES = [
  { id: 1, name: 'Electronics & Computing', slug: 'electronics', icon: 'Laptop', count: 24 },
  { id: 2, name: 'Audio & Acoustics', slug: 'audio', icon: 'Headphones', count: 18 },
  { id: 3, name: 'Wearables & Watches', slug: 'wearables', icon: 'Watch', count: 15 },
  { id: 4, name: 'Fashion & Apparel', slug: 'fashion', icon: 'Shirt', count: 32 },
  { id: 5, name: 'Footwear & Sneakers', slug: 'footwear', icon: 'Footprints', count: 19 },
  { id: 6, name: 'Home & Workspace', slug: 'workspace', icon: 'Armchair', count: 21 },
];

export const INITIAL_USERS = [
  {
    id: 1,
    name: 'Alex Johnson',
    email: 'customer@marketplace.com',
    role: 'CUSTOMER',
    createdAt: '2025-01-15T08:30:00Z',
    vendorRequest: false,
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    shippingAddress: {
      fullName: 'Alex Johnson',
      street: '742 Evergreen Terrace',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
    }
  },
  {
    id: 2,
    name: 'David Miller',
    email: 'vendor@marketplace.com',
    role: 'VENDOR',
    createdAt: '2024-11-10T12:00:00Z',
    vendorRequest: false,
    storeName: 'Aura Studio Tech',
    storeBio: 'Precision engineered modern peripherals and acoustic sound systems designed in California.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    verified: true,
  },
  {
    id: 3,
    name: 'Sarah Connor',
    email: 'admin@marketplace.com',
    role: 'ADMIN',
    createdAt: '2024-09-01T09:00:00Z',
    vendorRequest: false,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 4,
    name: 'Elena Rostova',
    email: 'elena@nordicliving.com',
    role: 'VENDOR',
    createdAt: '2024-12-05T14:20:00Z',
    vendorRequest: false,
    storeName: 'Nordic Craft Co.',
    storeBio: 'Minimalist Scandinavian ergonomic furniture and artisanal studio decor.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    verified: true,
  },
  {
    id: 5,
    name: 'Marcus Sterling',
    email: 'marcus@velocityapparel.com',
    role: 'CUSTOMER',
    createdAt: '2025-02-01T10:15:00Z',
    vendorRequest: true, // Pending vendor application!
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Aura Pro Studio Wireless Headphones',
    description: 'Custom titanium acoustic drivers with active noise cancellation, spatial audio positioning, and 40-hour battery life. Engineered for studio professionals and discerning audiophiles.',
    price: 349.00,
    stock: 28,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 2,
    category: { id: 2, name: 'Audio & Acoustics', slug: 'audio' },
    vendorId: 2,
    vendor: { id: 2, name: 'Aura Studio Tech' },
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 101, url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80' },
      { id: 102, url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80' },
      { id: 103, url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.9,
    reviewCount: 42,
    featured: true,
    isBestSeller: true,
    features: ['Active Noise Cancellation', 'Custom 40mm Titanium Drivers', 'USB-C Fast Charging', 'Bluetooth 5.3 Multipoint'],
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 2,
    name: 'Horizon Ultra-Slim Mechanical Keyboard',
    description: 'Low-profile aerospace-grade aluminum chassis with hot-swappable Kailh Choc V2 tactile switches, per-key RGB backlighting, and triple wireless connectivity (2.4G / BT / Type-C).',
    price: 169.00,
    stock: 45,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 1,
    category: { id: 1, name: 'Electronics & Computing', slug: 'electronics' },
    vendorId: 2,
    vendor: { id: 2, name: 'Aura Studio Tech' },
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 104, url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80' },
      { id: 105, url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.8,
    reviewCount: 31,
    featured: true,
    isBestSeller: false,
    features: ['Anodized Aluminum Body', 'Hot-Swappable Switches', 'Multi-Device Pairing', 'PBT Dye-Sub Keycaps'],
    createdAt: '2025-01-12T14:30:00Z',
  },
  {
    id: 3,
    name: 'Nordic Ergonomic Mesh Task Chair',
    description: 'Synchronous tilt mechanism with active lumbar adaptive support and breathable Italian engineered mesh. Certified BIFMA ergonomic seating for all-day focused comfort.',
    price: 520.00,
    stock: 14,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 6,
    category: { id: 6, name: 'Home & Workspace', slug: 'workspace' },
    vendorId: 4,
    vendor: { id: 4, name: 'Nordic Craft Co.' },
    imageUrl: 'https://images.unsplash.com/photo-1580481077197-0f86532cbcf1?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 106, url: 'https://images.unsplash.com/photo-1580481077197-0f86532cbcf1?auto=format&fit=crop&w=900&q=80' },
      { id: 107, url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.7,
    reviewCount: 19,
    featured: true,
    isBestSeller: true,
    features: ['Dynamic Lumbar Support', '4D Adjustable Armrests', 'Breathable High-Tension Mesh', '10-Year Framework Warranty'],
    createdAt: '2025-01-08T09:15:00Z',
  },
  {
    id: 4,
    name: 'Chronos Sapphire Hybrid Smartwatch',
    description: 'Sapphire crystal display over subtle micro-OLED panel, forged surgical titanium case, continuous ECG/SpO2 tracking, and up to 14 days of typical battery autonomy.',
    price: 289.00,
    stock: 32,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 3,
    category: { id: 3, name: 'Wearables & Watches', slug: 'wearables' },
    vendorId: 2,
    vendor: { id: 2, name: 'Aura Studio Tech' },
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 108, url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80' },
      { id: 109, url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.9,
    reviewCount: 56,
    featured: false,
    isBestSeller: true,
    features: ['Sapphire Glass Display', 'Waterproof 5 ATM', 'Real-time Heart & Sleep Tracking', '14-Day Battery Life'],
    createdAt: '2025-01-14T11:00:00Z',
  },
  {
    id: 5,
    name: 'Atelier Merino Wool Minimalist Overshirt',
    description: 'Woven from ethically sourced extra-fine Australian Merino wool. Naturally thermoregulating, crease-resistant, and cut in a contemporary relaxed boxy silhouette.',
    price: 145.00,
    stock: 22,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 4,
    category: { id: 4, name: 'Fashion & Apparel', slug: 'fashion' },
    vendorId: 4,
    vendor: { id: 4, name: 'Nordic Craft Co.' },
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 110, url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.6,
    reviewCount: 14,
    featured: false,
    isBestSeller: false,
    features: ['100% Australian Merino Wool', 'Horn Buttons', 'Dual Chest Pockets', 'Odor-Resistant Fiber'],
    createdAt: '2025-01-18T16:45:00Z',
  },
  {
    id: 6,
    name: 'Apex Precision Wireless Trackball Mouse',
    description: 'Ergonomic 20-degree sculpted tilt angle reduces forearm strain by 35%. Features dual sensor trackball navigation with precision dpi toggle and silent optical switches.',
    price: 99.00,
    stock: 60,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 1,
    category: { id: 1, name: 'Electronics & Computing', slug: 'electronics' },
    vendorId: 2,
    vendor: { id: 2, name: 'Aura Studio Tech' },
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 111, url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.7,
    reviewCount: 27,
    featured: false,
    isBestSeller: false,
    features: ['20-Degree Natural Angle', 'Fast Flow USB-C Charging', 'Dual Bluetooth + 2.4GHz', 'Silent Click Mechanism'],
    createdAt: '2025-01-20T13:20:00Z',
  },
  {
    id: 7,
    name: 'Strata Handcrafted Walnut Desk Shelf',
    description: 'Solid American black walnut monitor riser with integrated cork dampening pads and sculpted tray for pens, notebooks, and hardware peripherals.',
    price: 135.00,
    stock: 18,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 6,
    category: { id: 6, name: 'Home & Workspace', slug: 'workspace' },
    vendorId: 4,
    vendor: { id: 4, name: 'Nordic Craft Co.' },
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 112, url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.8,
    reviewCount: 38,
    featured: true,
    isBestSeller: true,
    features: ['Solid American Walnut', 'Supports up to 50 lbs', 'Natural Satin Oil Finish', 'Integrated Cable Trough'],
    createdAt: '2025-01-22T10:00:00Z',
  },
  {
    id: 8,
    name: 'Vanguard Technical Weatherproof Trench',
    description: 'Triple-layer 20,000mm waterproof breathable shell fabric with taped seams, magnetic storm flap closure, and packable storm hood.',
    price: 295.00,
    stock: 12,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 4,
    category: { id: 4, name: 'Fashion & Apparel', slug: 'fashion' },
    vendorId: 4,
    vendor: { id: 4, name: 'Nordic Craft Co.' },
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 113, url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.9,
    reviewCount: 22,
    featured: false,
    isBestSeller: false,
    features: ['3-Layer Membrane Construction', 'YKK Aquaguard Zippers', 'Taped Seam Protection', 'Reflective Accents'],
    createdAt: '2025-01-25T14:10:00Z',
  },
  {
    id: 9,
    name: 'Kinesis Kinetic Trail Runner',
    description: 'Responsive supercritical nitrogen-infused foam midsole paired with Vibram Megagrip traction lug outsole for mountain runs and urban street surfaces.',
    price: 175.00,
    stock: 35,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 5,
    category: { id: 5, name: 'Footwear & Sneakers', slug: 'footwear' },
    vendorId: 2,
    vendor: { id: 2, name: 'Aura Studio Tech' },
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 114, url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.8,
    reviewCount: 47,
    featured: true,
    isBestSeller: true,
    features: ['Supercritical Nitrogen Foam', 'Vibram Megagrip Outsole', 'Engineered Breathable Jacquard', 'Recycled TPU Overlays'],
    createdAt: '2025-01-28T09:00:00Z',
  },
  {
    id: 10,
    name: 'Linear Hi-Fi Desktop Tube DAC/Amp',
    description: 'Dual ES9038Q2M DAC chips driving matched Russian vacuum tubes for warm analog harmonic richness with modern 32-bit/768kHz DSD512 decode capability.',
    price: 420.00,
    stock: 8,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 2,
    category: { id: 2, name: 'Audio & Acoustics', slug: 'audio' },
    vendorId: 2,
    vendor: { id: 2, name: 'Aura Studio Tech' },
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 115, url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 5.0,
    reviewCount: 16,
    featured: false,
    isBestSeller: false,
    features: ['Dual ESS Sabre DACs', 'Matched Vacuum Tube Stage', 'Balanced XLR & 4.4mm Output', 'OLED Sample Rate Indicator'],
    createdAt: '2025-02-01T15:30:00Z',
  },
  {
    id: 11,
    name: 'Minimalist Matte Ceramic Planter & Saucer',
    description: 'Cast in stoneware clay with a tactile raw matte exterior glaze and sealed interior for healthy root respiration and clean modern botanical display.',
    price: 48.00,
    stock: 50,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 6,
    category: { id: 6, name: 'Home & Workspace', slug: 'workspace' },
    vendorId: 4,
    vendor: { id: 4, name: 'Nordic Craft Co.' },
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 116, url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.5,
    reviewCount: 9,
    featured: false,
    isBestSeller: false,
    features: ['High-Fire Stoneware Clay', 'Built-in Drainage with Saucer', 'Matte Texturized Finish'],
    createdAt: '2025-02-03T11:20:00Z',
  },
  {
    id: 12,
    name: 'Ventus Carbon Fibre Commuter Backpack',
    description: 'Ultralight waterproof dimension-polyant VX21 laminate, Fidlock magnetic sternum clips, and suspended 16-inch laptop compartment with water-repellent zippers.',
    price: 210.00,
    stock: 25,
    status: 'ACTIVE',
    deleted: false,
    categoryId: 4,
    category: { id: 4, name: 'Fashion & Apparel', slug: 'fashion' },
    vendorId: 2,
    vendor: { id: 2, name: 'Aura Studio Tech' },
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 117, url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80' },
    ],
    rating: 4.9,
    reviewCount: 39,
    featured: true,
    isBestSeller: true,
    features: ['VX21 X-Pac Waterproof Fabric', 'Fidlock V-Buckles', 'Padded 16" Laptop Sleeve', 'Luggage Pass-Through'],
    createdAt: '2025-02-05T12:00:00Z',
  },
];

export const INITIAL_REVIEWS = [
  {
    id: 1,
    productId: 1,
    userId: 1,
    userName: 'Alex Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Absolute studio fidelity. The noise cancellation is breathtaking.',
    comment: 'I use these daily for podcast editing and long flights. The titanium drivers produce an incredibly balanced soundstage with tight low-end that does not muddy vocal clarity. The battery lasts well over a full work week on one charge.',
    createdAt: '2025-01-20T14:32:00Z',
  },
  {
    id: 2,
    productId: 1,
    userId: 5,
    userName: 'Marcus Sterling',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    title: 'Premium build quality, comfortable memory foam ear cushions.',
    comment: 'Slightly tight clamping force for the first two days, but once the memory foam broke in, they became the most comfortable cans in my collection. Microphone quality on calls is also surprisingly crisp.',
    createdAt: '2025-01-28T09:15:00Z',
  },
  {
    id: 3,
    productId: 2,
    userId: 1,
    userName: 'Alex Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Typing feel is unmatched for low-profile enthusiasts.',
    comment: 'The aluminum top plate gives this keyboard a zero-flex rigidity. Bluetooth switches between my MacBook and Windows workstation in under a second.',
    createdAt: '2025-02-02T18:40:00Z',
  },
];

export const INITIAL_ORDERS = [
  {
    id: 1001,
    userId: 1,
    customerName: 'Alex Johnson',
    customerEmail: 'customer@marketplace.com',
    totalAmount: 518.00,
    status: 'DELIVERED',
    createdAt: '2025-01-22T10:14:00Z',
    deliveredAt: '2025-01-26T16:20:00Z',
    trackingNumber: 'TRK-9842104-US',
    carrier: 'FedEx Express',
    shippingAddress: {
      fullName: 'Alex Johnson',
      street: '742 Evergreen Terrace',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
    },
    paymentMethod: 'Credit Card (•••• 4242)',
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 1,
        price: 349.00,
        product: {
          id: 1,
          name: 'Aura Pro Studio Wireless Headphones',
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
          vendorId: 2,
          vendorName: 'Aura Studio Tech',
        }
      },
      {
        id: 2,
        productId: 2,
        quantity: 1,
        price: 169.00,
        product: {
          id: 2,
          name: 'Horizon Ultra-Slim Mechanical Keyboard',
          imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=200&q=80',
          vendorId: 2,
          vendorName: 'Aura Studio Tech',
        }
      }
    ]
  },
  {
    id: 1002,
    userId: 1,
    customerName: 'Alex Johnson',
    customerEmail: 'customer@marketplace.com',
    totalAmount: 175.00,
    status: 'SHIPPED',
    createdAt: '2025-02-04T15:45:00Z',
    trackingNumber: 'TRK-7719203-US',
    carrier: 'UPS Ground',
    shippingAddress: {
      fullName: 'Alex Johnson',
      street: '742 Evergreen Terrace',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
    },
    paymentMethod: 'Apple Pay',
    items: [
      {
        id: 3,
        productId: 9,
        quantity: 1,
        price: 175.00,
        product: {
          id: 9,
          name: 'Kinesis Kinetic Trail Runner',
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
          vendorId: 2,
          vendorName: 'Aura Studio Tech',
        }
      }
    ]
  },
  {
    id: 1003,
    userId: 5,
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus@velocityapparel.com',
    totalAmount: 520.00,
    status: 'CONFIRMED',
    createdAt: '2025-02-08T09:20:00Z',
    trackingNumber: 'PENDING',
    carrier: 'DHL Express',
    shippingAddress: {
      fullName: 'Marcus Sterling',
      street: '450 Mission Bay Blvd',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94158',
      country: 'United States',
    },
    paymentMethod: 'Credit Card (•••• 8821)',
    items: [
      {
        id: 4,
        productId: 3,
        quantity: 1,
        price: 520.00,
        product: {
          id: 3,
          name: 'Nordic Ergonomic Mesh Task Chair',
          imageUrl: 'https://images.unsplash.com/photo-1580481077197-0f86532cbcf1?auto=format&fit=crop&w=200&q=80',
          vendorId: 4,
          vendorName: 'Nordic Craft Co.',
        }
      }
    ]
  },
  {
    id: 1004,
    userId: 1,
    customerName: 'Alex Johnson',
    customerEmail: 'customer@marketplace.com',
    totalAmount: 135.00,
    status: 'PENDING',
    createdAt: '2025-02-10T11:05:00Z',
    trackingNumber: 'PENDING',
    carrier: 'Standard Shipping',
    shippingAddress: {
      fullName: 'Alex Johnson',
      street: '742 Evergreen Terrace',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
      country: 'United States',
    },
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        id: 5,
        productId: 7,
        quantity: 1,
        price: 135.00,
        product: {
          id: 7,
          name: 'Strata Handcrafted Walnut Desk Shelf',
          imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=200&q=80',
          vendorId: 4,
          vendorName: 'Nordic Craft Co.',
        }
      }
    ]
  }
];

// Persistent Mock Storage Engine for browser testing & offline fallback
class MockStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem('mp_products')) {
      localStorage.setItem('mp_products', JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem('mp_categories')) {
      localStorage.setItem('mp_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem('mp_users')) {
      localStorage.setItem('mp_users', JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem('mp_orders')) {
      localStorage.setItem('mp_orders', JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem('mp_reviews')) {
      localStorage.setItem('mp_reviews', JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem('mp_cart')) {
      localStorage.setItem('mp_cart', JSON.stringify({
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 1,
            product: INITIAL_PRODUCTS[0],
          }
        ]
      }));
    }
  }

  getProducts() {
    return JSON.parse(localStorage.getItem('mp_products') || '[]');
  }
  setProducts(data) {
    localStorage.setItem('mp_products', JSON.stringify(data));
  }

  getCategories() {
    return JSON.parse(localStorage.getItem('mp_categories') || '[]');
  }
  setCategories(data) {
    localStorage.setItem('mp_categories', JSON.stringify(data));
  }

  getUsers() {
    return JSON.parse(localStorage.getItem('mp_users') || '[]');
  }
  setUsers(data) {
    localStorage.setItem('mp_users', JSON.stringify(data));
  }

  getOrders() {
    return JSON.parse(localStorage.getItem('mp_orders') || '[]');
  }
  setOrders(data) {
    localStorage.setItem('mp_orders', JSON.stringify(data));
  }

  getReviews() {
    return JSON.parse(localStorage.getItem('mp_reviews') || '[]');
  }
  setReviews(data) {
    localStorage.setItem('mp_reviews', JSON.stringify(data));
  }

  getCart() {
    return JSON.parse(localStorage.getItem('mp_cart') || '{"items":[]}');
  }
  setCart(data) {
    localStorage.setItem('mp_cart', JSON.stringify(data));
  }
}

export const mockStorage = new MockStore();
