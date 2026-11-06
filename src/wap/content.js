// West African Produce copy. Source: westafricanproduce.com (current site), wording lightly edited.
// Edit here to change text across the storefront.

export const brand = {
  name: 'West African Produce',
  short: 'W',
  tagline: 'Experience the taste of Africa',
  // The live site lists this address. Its domain is westafricanproduce.com, so confirm it before launch.
  email: 'sales@westafricaproduce.com',
  address: ['1530 W Sam Houston Pkwy North', 'Houston, Texas 77043'],
  instagram: 'https://instagram.com/westafricanproduce',
  facebook: 'https://www.facebook.com/profile.php?id=100093987900154',
}

export const pillars = [
  {
    title: 'Sustainable sourcing',
    body: 'Our oils come from small farm holders in West Africa, then are mechanically filtered or pressed for clean flavor and quality.',
  },
  {
    title: 'No needless deforestation',
    body: 'West African Produce focuses on low-altitude crop land in sub-Sahara Africa, where palm can be grown without the plantation pressure seen elsewhere.',
  },
  {
    title: 'Shelf and kitchen ready',
    body: 'Retail bottles, cases, frozen vegetables, smoked fish, spices, and private-label options all sit under one produce program.',
  },
]

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'palm-oil', label: 'Palm Oil' },
  { id: 'smoked-fish', label: 'Smoked Fish' },
  { id: 'frozen-vegetables', label: 'Frozen Vegetables' },
  { id: 'spices', label: 'Spices' },
]

export const wholesale = {
  intro:
    'West African Produce partners with wholesalers in Texas and the Washington DC metro area. Orders are placed by the pallet, and we offer private labeling so you can put your own brand on our products.',
  palletNote: 'For example, a pallet of palm oil holds 60 cases, each containing 4 gallons.',
  interests: ['Palm oil pallet', 'Smoked fish', 'Frozen vegetables', 'Spices', 'Private label', 'Other'],
}

export const productFamilies = [
  {
    title: 'Oils',
    eyebrow: 'Natural and mechanically filtered',
    body:
      'Crude natural red palm oil from environmentally friendly low-altitude crop land in sub-Sahara Africa, plus coconut oil and ground nut oil sourced from small farm holders.',
    items: ['Natural Red Palm Oil', 'Future RBD Red Palm Oil', 'Coconut Oil', 'Ground Nut Oil'],
  },
  {
    title: 'Smoked fish',
    eyebrow: 'Case-ready seafood',
    body: 'A West African smoked fish line for home cooks, restaurants, and grocers.',
    items: ['Kuta / Barracuda', 'Kinnie / Baby Barracuda', 'Catfish', 'Grouper', 'Skit', 'Baby Shark'],
  },
  {
    title: 'Frozen vegetables',
    eyebrow: 'Greens for soups and stews',
    body: 'Farm-sourced leaves frozen for year-round cooking.',
    items: ['Potato Leaves', 'Cassava Leaves', 'Crain Crain / Jute Leaves'],
  },
  {
    title: 'Spices',
    eyebrow: 'Pantry seasonings',
    body: 'Everyday seasonings for West African cooking and retail shelves.',
    items: ['Curry Powder', 'Pure Ground Ginger', 'Ground Black Pepper', 'All in One Seasoning', 'Thyme', 'Cayenne Pepper'],
  },
]

// Retail palm oil sizes shown in the hero and shop. Live API prices overlay these when present.
export const palmVolumes = [
  {
    id: '16oz',
    label: '16 oz',
    unit: '16 ounce jar',
    bottleLabel: '16 OZ',
    sku: 'palm-oil-16oz',
    price_cents: 800,
    caseSku: 'palm-oil-16oz-case',
    caseCount: 12,
    casePriceCents: 8000,
    caseUnit: 'case of 12 · 16 oz',
  },
  {
    id: '32oz',
    label: '32 oz',
    unit: '32 ounce jar',
    bottleLabel: '32 OZ',
    sku: 'palm-oil-32oz',
    price_cents: 1400,
    caseSku: 'palm-oil-32oz-case',
    caseCount: 12,
    casePriceCents: 14000,
    caseUnit: 'case of 12 · 32 oz',
  },
  {
    id: 'half',
    label: '1/2 gal',
    unit: '1/2 gallon',
    bottleLabel: '1/2 GALLON',
    sku: 'palm-oil-half',
    price_cents: 1800,
    caseSku: 'palm-oil-half-case',
    caseCount: 6,
    casePriceCents: 9000,
    caseUnit: 'case of 6 · 1/2 gal',
  },
  {
    id: '1gal',
    label: '1 gal',
    unit: '1 gallon',
    bottleLabel: '1 GALLON',
    sku: 'palm-oil-1gal',
    price_cents: 3000,
    caseSku: 'palm-oil-case',
    caseCount: 4,
    casePriceCents: 10000,
    caseUnit: 'case of 4 gallons',
  },
]

const PALM_DESCRIPTION =
  'Sustainably sourced from small farm holders in Sierra Leone. High smoke point for frying, stews, soups, and sauces.'

export const palmCatalogProducts = palmVolumes.flatMap((volume, index) => [
  {
    sku: volume.sku,
    name: 'Organic Red Palm Oil',
    category: 'palm-oil',
    description: PALM_DESCRIPTION,
    unit: volume.unit,
    price_cents: volume.price_cents,
    availability: 'in_stock',
    sort_order: index * 2 + 1,
  },
  {
    sku: volume.caseSku,
    name: `Organic Red Palm Oil, Case of ${volume.caseCount}`,
    category: 'palm-oil',
    description: `One case: ${volume.caseCount} ${volume.unit} containers for kitchens, caterers, and small retailers.`,
    unit: volume.caseUnit,
    price_cents: volume.casePriceCents,
    availability: 'in_stock',
    sort_order: index * 2 + 2,
  },
])

export const priceGuides = [
  {
    title: 'Natural Red Palm Oil',
    note: 'Bottle and case program',
    rows: [
      ['5 Gallon', '1/case', '$55', '$48'],
      ['1 Gallon', '4/case', '$16', '$14.50'],
      ['1/2 Gallon', '6/case', '$9', '$7.99'],
      ['32 Ounce', '12/case', '$6', '$4.50'],
      ['16 Ounce', '12/case', '$3', '$2'],
    ],
  },
  {
    title: 'Smoked Fish',
    note: 'Price per pound',
    rows: [
      ['Kuta', '30 lb case', '$12', '$10.50'],
      ['Kuta', '50 lb case', '$7.25', '$6.50'],
      ['Kinnie', '30 lb case', '$7', '$6.50'],
      ['Catfish', '30 lb case', '$7', '$6'],
      ['Herring', '30 lb case', '$6.75', '$5.50'],
    ],
  },
  {
    title: 'Spices',
    note: 'Bottle and bag program',
    rows: [
      ['Black Pepper 16 oz', '24/case', '$3.50', '$3'],
      ['Black Pepper 32 oz', '12/case', '$6.99', '$5.99'],
      ['Curry 16 oz', '24/case', '$2.25', '$1.99'],
      ['Curry 5 lb bag', '4/case', '$13.99', '$11.99'],
      ['Ginger 5 lb bag', '4/case', '$24', '$23'],
    ],
  },
]

export const recipes = [
  {
    title: 'Ground Nut Soup',
    body: 'A rich peanut-based soup built for West African Produce ground nut oil, smoked fish, hot pepper, and greens.',
    ingredients: ['Ground nut oil', 'Smoked fish', 'Ground ginger', 'Cayenne pepper'],
  },
  {
    title: 'Plassas',
    body: 'A greens-forward staple made with cassava or potato leaves, palm oil, spices, and smoked fish.',
    ingredients: ['Red palm oil', 'Cassava leaves', 'Kuta or catfish', 'All in One Seasoning'],
  },
]
