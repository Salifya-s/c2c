import type {DeliverySlot, Order, Seller} from '../types/commerce';

export const sellers: Seller[] = [
  {
    id: 'mama-kunda',
    name: "Mama Kunda's Kitchen",
    handle: '@kundaskitchen',
    category: 'Food vendor',
    location: 'Kabulonga, Lusaka',
    rating: 4.8,
    reviews: 247,
    responseTime: 'under 1 min',
    verifiedLevel: 'Food Safety Verified',
    completedOrders: 890,
    minimumOrder: 70,
    openingHours: '08:00 - 20:00',
    deliveryAvailable: true,
    completionRate: 96,
    disputeRate: 1.4,
    open: true,
    deliveryZones: ['Kabulonga', 'Woodlands', 'Ibex Hill', 'Longacres'],
    policies: ['Escrow releases after delivery PIN', 'Refunds reviewed within 24 hours', 'Orders pause when stock is low'],
    products: [
      {
        id: 'chicken-chips',
        name: 'Chicken and chips',
        category: 'Lunch',
        price: 120,
        stock: 18,
        description: 'Grilled chicken, fresh chips, salad, and chilli sauce.',
        imageStyle: 'from-zam-green-100 to-zam-green-200',
        tags: ['popular', 'delivery-ready', 'lunch']
        ,available: true, deliveryEligible: true, prepMinutes: 25, variants: ['Regular', 'Extra chilli', 'No chilli']
      },
      {
        id: 'nshima-chicken',
        name: 'Nshima with village chicken',
        category: 'Traditional',
        price: 145,
        stock: 9,
        description: 'Village chicken stew with nshima and seasonal vegetables.',
        imageStyle: 'from-zam-amber-100 to-zam-amber-200',
        tags: ['traditional', 'limited-stock'], available: true, deliveryEligible: true, prepMinutes: 35, variants: ['Regular', 'Extra relish']
      },
      {
        id: 'vitumbuwa-pack',
        name: 'Vitumbuwa party pack',
        category: 'Snacks',
        price: 75,
        stock: 6,
        description: 'Ten sweet fritters packed for office tea or school events.',
        imageStyle: 'from-ink-5 to-ink-4',
        tags: ['advance-order', 'snacks'], available: true, deliveryEligible: true, prepMinutes: 20, variants: ['Plain', 'Sugar dusted']
      }
    ]
  },
  {
    id: 'chanda-styles',
    name: 'Chanda Styles',
    handle: '@chandastyles',
    category: 'Fashion seller',
    location: 'Town Centre, Kitwe',
    rating: 4.6,
    reviews: 183,
    responseTime: '3 min',
    verifiedLevel: 'Business Verified',
    completedOrders: 640,
    minimumOrder: 120,
    openingHours: '09:00 - 18:00',
    deliveryAvailable: true,
    completionRate: 92,
    disputeRate: 2.1,
    open: true,
    deliveryZones: ['Kitwe CBD', 'Riverside', 'Parklands'],
    policies: ['Sizes confirmed before checkout', 'Alterations require a booking slot', 'Escrow releases after buyer confirmation'],
    products: [
      {
        id: 'chitenge-dress',
        name: 'Custom chitenge dress',
        category: 'Fashion',
        price: 380,
        stock: 5,
        description: 'Made-to-measure dress with customer-selected pattern.',
        imageStyle: 'from-zam-green-50 to-zam-amber-100',
        tags: ['custom', 'service-booking'], available: true, deliveryEligible: true, prepMinutes: 1440, variants: ['Small', 'Medium', 'Large']
      },
      {
        id: 'mens-kaftan',
        name: "Men's kaftan",
        category: 'Fashion',
        price: 310,
        stock: 8,
        description: 'Smart kaftan with three fabric choices and sleeve options.',
        imageStyle: 'from-zam-amber-50 to-ink-5',
        tags: ['made-to-order', 'pickup'], available: true, deliveryEligible: true, prepMinutes: 1440, variants: ['Small', 'Medium', 'Large']
      }
    ]
  },
  {
    id: 'baked-tasha',
    name: "Tasha's Cakes",
    handle: '@tashabakes',
    category: 'Bakery',
    location: 'Roma, Lusaka',
    rating: 4.9,
    reviews: 201,
    responseTime: '5 min',
    verifiedLevel: 'Business Verified',
    completedOrders: 440,
    minimumOrder: 150,
    openingHours: '07:00 - 17:00',
    deliveryAvailable: true,
    completionRate: 95,
    disputeRate: 1.1,
    open: true,
    deliveryZones: ['Roma', 'Manda Hill', 'Kabulonga', 'Arcades'],
    policies: ['Custom cakes require a 50% protected deposit', 'Same-day cupcakes while stock lasts'],
    products: [
      {id: 'chocolate-cake', name: 'Chocolate birthday cake', category: 'Bakery', price: 450, stock: 4, description: 'Rich chocolate cake with custom message.', imageStyle: 'from-zam-green-200 to-ink-5', tags: ['cake', 'birthday'], available: true, deliveryEligible: true, prepMinutes: 180, variants: ['Vanilla cream', 'Chocolate cream']},
      {id: 'cupcake-box', name: 'Cupcake box of 12', category: 'Bakery', price: 180, stock: 12, description: 'Assorted cupcakes for office or parties.', imageStyle: 'from-zam-green-100 to-zam-green-200', tags: ['cupcakes', 'party'], available: true, deliveryEligible: true, prepMinutes: 60, variants: ['Mixed', 'Chocolate']},
      {id: 'scones-pack', name: 'Scones pack', category: 'Bakery', price: 95, stock: 0, description: 'Fresh butter scones, currently sold out.', imageStyle: 'from-zam-amber-100 to-zam-amber-200', tags: ['breakfast'], available: false, deliveryEligible: true, prepMinutes: 30}
    ]
  },
  {
    id: 'mwila-beauty',
    name: 'Mwila Beauty Bar',
    handle: '@mwilabeauty',
    category: 'Beauty',
    location: 'Woodlands, Lusaka',
    rating: 4.7,
    reviews: 164,
    responseTime: '8 min',
    verifiedLevel: 'Identity Verified',
    completedOrders: 320,
    minimumOrder: 80,
    openingHours: '09:00 - 19:00',
    deliveryAvailable: true,
    completionRate: 91,
    disputeRate: 1.9,
    open: true,
    deliveryZones: ['Woodlands', 'Kabulonga', 'Chilenje'],
    policies: ['Sealed products refundable within 24 hours', 'Appointments require confirmation'],
    products: [
      {id: 'shea-butter', name: 'Shea butter jar', category: 'Beauty', price: 85, stock: 20, description: 'Natural shea butter for skin and hair.', imageStyle: 'from-ink-5 to-ink-4', tags: ['beauty', 'delivered-today'], available: true, deliveryEligible: true, prepMinutes: 10},
      {id: 'makeup-session', name: 'Event makeup session', category: 'Services', price: 350, stock: 5, description: 'Glam makeup appointment with lashes.', imageStyle: 'from-zam-green-50 to-zam-amber-100', tags: ['makeup artist', 'service'], available: true, deliveryEligible: false, prepMinutes: 90, variants: ['Natural', 'Full glam']},
      {id: 'braid-spray', name: 'Braid conditioning spray', category: 'Beauty', price: 65, stock: 16, description: 'Hydrating spray for braids and twists.', imageStyle: 'from-zam-amber-50 to-ink-5', tags: ['hair', 'beauty'], available: true, deliveryEligible: true, prepMinutes: 10}
    ]
  },
  {
    id: 'greenfield-grocers',
    name: 'Greenfield Grocers',
    handle: '@greenfieldgrocers',
    category: 'Groceries',
    location: 'Ibex Hill, Lusaka',
    rating: 4.5,
    reviews: 98,
    responseTime: '2 min',
    verifiedLevel: 'Identity Verified',
    completedOrders: 2100,
    minimumOrder: 100,
    openingHours: '06:30 - 21:00',
    deliveryAvailable: true,
    completionRate: 94,
    disputeRate: 2.4,
    open: true,
    deliveryZones: ['Ibex Hill', 'Avondale', 'Kabulonga'],
    policies: ['Fresh produce replacements approved before dispatch'],
    products: [
      {id: 'veg-box', name: 'Vegetable box', category: 'Groceries', price: 160, stock: 15, description: 'Tomatoes, onion, rape, carrots, and potatoes.', imageStyle: 'from-zam-green-200 to-ink-5', tags: ['groceries', 'fresh'], available: true, deliveryEligible: true, prepMinutes: 25},
      {id: 'tomatoes-crate', name: 'Tomatoes crate', category: 'Groceries', price: 120, stock: 9, description: 'Fresh market tomatoes, medium crate.', imageStyle: 'from-zam-green-100 to-zam-green-200', tags: ['tomatoes'], available: true, deliveryEligible: true, prepMinutes: 20},
      {id: 'fruit-basket', name: 'Mixed fruit basket', category: 'Groceries', price: 210, stock: 6, description: 'Seasonal fruits for home or office.', imageStyle: 'from-zam-amber-100 to-zam-amber-200', tags: ['fruit', 'healthy'], available: true, deliveryEligible: true, prepMinutes: 30}
    ]
  },
  {
    id: 'sole-step',
    name: 'Sole Step Shoes',
    handle: '@solestep',
    category: 'Fashion',
    location: 'Kamwala, Lusaka',
    rating: 4.2,
    reviews: 74,
    responseTime: '15 min',
    verifiedLevel: 'Unverified',
    completedOrders: 190,
    minimumOrder: 180,
    openingHours: '08:00 - 18:00',
    deliveryAvailable: true,
    completionRate: 87,
    disputeRate: 4.1,
    open: true,
    deliveryZones: ['Kamwala', 'Town Centre', 'Chilenje'],
    policies: ['Size exchange within 48 hours if unworn'],
    products: [
      {id: 'white-sneakers', name: 'White sneakers', category: 'Fashion', price: 320, stock: 8, description: 'Clean everyday sneakers.', imageStyle: 'from-ink-5 to-ink-4', tags: ['shoes', 'sneakers'], available: true, deliveryEligible: true, prepMinutes: 20, variants: ['Size 6', 'Size 7', 'Size 8']},
      {id: 'school-shoes', name: 'School shoes', category: 'Fashion', price: 260, stock: 10, description: 'Durable black school shoes.', imageStyle: 'from-zam-green-50 to-zam-amber-100', tags: ['shoes', 'school'], available: true, deliveryEligible: true, prepMinutes: 20, variants: ['Size 3', 'Size 4', 'Size 5']},
      {id: 'sandals', name: 'Leather sandals', category: 'Fashion', price: 190, stock: 0, description: 'Handmade leather sandals.', imageStyle: 'from-zam-amber-50 to-ink-5', tags: ['sandals'], available: false, deliveryEligible: true, prepMinutes: 30}
    ]
  },
  {
    id: 'quickfix-tech',
    name: 'QuickFix Tech',
    handle: '@quickfixtech',
    category: 'Services',
    location: 'Longacres, Lusaka',
    rating: 4.6,
    reviews: 143,
    responseTime: '12 min',
    verifiedLevel: 'Business Verified',
    completedOrders: 560,
    minimumOrder: 120,
    openingHours: '08:30 - 18:30',
    deliveryAvailable: false,
    completionRate: 93,
    disputeRate: 2.8,
    open: true,
    deliveryZones: ['Workshop pickup only'],
    policies: ['Diagnostics fee applies before repair quote'],
    products: [
      {id: 'screen-repair', name: 'Phone screen repair', category: 'Services', price: 650, stock: 4, description: 'Common phone screen replacement service.', imageStyle: 'from-zam-green-200 to-ink-5', tags: ['repair', 'phone'], available: true, deliveryEligible: false, prepMinutes: 180},
      {id: 'battery-swap', name: 'Battery replacement', category: 'Services', price: 280, stock: 7, description: 'Battery replacement for supported phones.', imageStyle: 'from-zam-green-100 to-zam-green-200', tags: ['battery', 'repair'], available: true, deliveryEligible: false, prepMinutes: 90},
      {id: 'laptop-clean', name: 'Laptop service clean', category: 'Services', price: 180, stock: 5, description: 'Dust cleaning and thermal paste refresh.', imageStyle: 'from-zam-amber-100 to-zam-amber-200', tags: ['laptop', 'service'], available: true, deliveryEligible: false, prepMinutes: 120}
    ]
  },
  {
    id: 'lusaka-tailor',
    name: 'Lusaka Tailor Studio',
    handle: '@lusakatailor',
    category: 'Services',
    location: 'Chilenje, Lusaka',
    rating: 4.4,
    reviews: 119,
    responseTime: '9 min',
    verifiedLevel: 'Identity Verified',
    completedOrders: 275,
    minimumOrder: 100,
    openingHours: '08:00 - 17:00',
    deliveryAvailable: true,
    completionRate: 90,
    disputeRate: 3.2,
    open: true,
    deliveryZones: ['Chilenje', 'Kabwata', 'Woodlands'],
    policies: ['Alterations depend on measurement confirmation'],
    products: [
      {id: 'dress-alteration', name: 'Dress alteration', category: 'Services', price: 150, stock: 6, description: 'Hemming, waist adjustment, and fit corrections.', imageStyle: 'from-ink-5 to-ink-4', tags: ['tailor', 'alteration'], available: true, deliveryEligible: true, prepMinutes: 1440},
      {id: 'school-uniform', name: 'School uniform stitching', category: 'Services', price: 420, stock: 4, description: 'Custom school uniform set.', imageStyle: 'from-zam-green-50 to-zam-amber-100', tags: ['tailor', 'uniform'], available: true, deliveryEligible: true, prepMinutes: 2880},
      {id: 'zip-repair', name: 'Zip repair', category: 'Services', price: 70, stock: 12, description: 'Fast zip replacement for trousers, skirts, and bags.', imageStyle: 'from-zam-amber-50 to-ink-5', tags: ['tailor', 'quick'], available: true, deliveryEligible: true, prepMinutes: 60}
    ]
  },
  {
    id: 'petals-lusaka',
    name: 'Petals Lusaka',
    handle: '@petalslusaka',
    category: 'Gifts',
    location: 'Mass Media, Lusaka',
    rating: 4.8,
    reviews: 86,
    responseTime: '6 min',
    verifiedLevel: 'Business Verified',
    completedOrders: 230,
    minimumOrder: 180,
    openingHours: '08:00 - 19:00',
    deliveryAvailable: true,
    completionRate: 97,
    disputeRate: 0.9,
    open: true,
    deliveryZones: ['Mass Media', 'Roma', 'Longacres', 'Kabulonga'],
    policies: ['Flower substitutions confirmed before delivery'],
    products: [
      {id: 'rose-bouquet', name: 'Rose bouquet', category: 'Gifts', price: 280, stock: 11, description: 'Fresh roses wrapped for delivery.', imageStyle: 'from-zam-green-200 to-ink-5', tags: ['flowers', 'gift'], available: true, deliveryEligible: true, prepMinutes: 45},
      {id: 'gift-hamper', name: 'Snack gift hamper', category: 'Gifts', price: 360, stock: 5, description: 'Assorted snacks and card in gift packaging.', imageStyle: 'from-zam-green-100 to-zam-green-200', tags: ['gift', 'hamper'], available: true, deliveryEligible: true, prepMinutes: 60},
      {id: 'balloon-set', name: 'Birthday balloon set', category: 'Gifts', price: 220, stock: 7, description: 'Decorative birthday balloon set.', imageStyle: 'from-zam-amber-100 to-zam-amber-200', tags: ['birthday', 'party'], available: true, deliveryEligible: true, prepMinutes: 40}
    ]
  }
];

export const deliverySlots: DeliverySlot[] = [
  {id: 'slot-lunch', label: 'Today, 12:30 - 13:30', fee: 35, capacity: 8},
  {id: 'slot-afternoon', label: 'Today, 15:00 - 16:00', fee: 30, capacity: 5},
  {id: 'slot-evening', label: 'Today, 18:00 - 19:00', fee: 40, capacity: 3}
];

export const initialOrders: Order[] = [
  {
    id: 'ZC-1042',
    sellerId: 'mama-kunda',
    customerName: 'Bupe M.',
    items: [{productId: 'chicken-chips', quantity: 2}],
    fulfilmentMethod: 'delivery',
    deliverySlotId: 'slot-lunch',
    status: 'paid',
    escrowPin: '4821',
    paidAt: '10:18'
  },
  {
    id: 'ZC-1041',
    sellerId: 'mama-kunda',
    customerName: 'Natasha C.',
    items: [{productId: 'vitumbuwa-pack', quantity: 1}],
    fulfilmentMethod: 'pickup',
    deliverySlotId: 'slot-afternoon',
    status: 'preparing',
    escrowPin: '7194',
    paidAt: '09:44'
  }
];
