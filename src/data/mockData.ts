import { Product, CheckoutStep, AddOn } from '@/types/checkout';

export const mockProduct: Product = {
  id: 'product-1',
  name: 'Premium Wireless Headphones',
  description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort.',
  basePrice: 299,
  image: '/src/assets/headphones-hero.jpg',
  variants: [
    { id: 'color-black', name: 'Color', value: 'Midnight Black', priceModifier: 0 },
    { id: 'color-white', name: 'Color', value: 'Pearl White', priceModifier: 0 },
    { id: 'color-blue', name: 'Color', value: 'Ocean Blue', priceModifier: 25 },
    { id: 'color-red', name: 'Color', value: 'Crimson Red', priceModifier: 25 }
  ]
};

export const checkoutSteps: CheckoutStep[] = [
  {
    id: 1,
    title: 'Essential Accessories',
    description: 'Complete your setup with these essential accessories',
    addOns: [
      {
        id: 'case-premium',
        name: 'Premium Carrying Case',
        description: 'Protect your headphones with our durable carrying case',
        price: 49,
        category: 'protection',
        popular: true
      },
      {
        id: 'cable-usbc',
        name: 'USB-C Charging Cable',
        description: 'Extra-long USB-C cable for convenient charging',
        price: 19,
        category: 'charging'
      },
      {
        id: 'stand-desktop',
        name: 'Desktop Stand',
        description: 'Elegant stand to display and store your headphones',
        price: 39,
        category: 'accessories'
      }
    ]
  },
  {
    id: 2,
    title: 'Audio Enhancement',
    description: 'Enhance your listening experience',
    addOns: [
      {
        id: 'equalizer-pro',
        name: 'Pro EQ Software License',
        description: 'Professional equalizer software with custom presets',
        price: 29,
        category: 'software',
        popular: true
      },
      {
        id: 'cushions-memory',
        name: 'Memory Foam Cushions',
        description: 'Ultra-comfortable memory foam ear cushions',
        price: 35,
        category: 'comfort'
      },
      {
        id: 'adapter-airplane',
        name: 'Airplane Adapter',
        description: 'Use your headphones with airplane entertainment systems',
        price: 15,
        category: 'travel'
      }
    ]
  },
  {
    id: 3,
    title: 'Care & Maintenance',
    description: 'Keep your headphones in perfect condition',
    addOns: [
      {
        id: 'warranty-extended',
        name: 'Extended Warranty (2 Years)',
        description: 'Comprehensive coverage for accidental damage and defects',
        price: 79,
        category: 'warranty',
        popular: true
      },
      {
        id: 'cleaning-kit',
        name: 'Professional Cleaning Kit',
        description: 'Specialized cleaning solutions and microfiber cloths',
        price: 25,
        category: 'maintenance'
      },
      {
        id: 'replacement-parts',
        name: 'Replacement Parts Kit',
        description: 'Spare ear pads, headband cushion, and screws',
        price: 45,
        category: 'maintenance'
      }
    ]
  },
  {
    id: 4,
    title: 'Smart Features',
    description: 'Unlock advanced functionality',
    addOns: [
      {
        id: 'app-premium',
        name: 'Premium App Subscription',
        description: 'Access to premium features, custom sound profiles, and analytics',
        price: 9.99,
        category: 'software',
        popular: true
      },
      {
        id: 'assistant-integration',
        name: 'Smart Assistant Integration',
        description: 'Enhanced voice assistant features and wake word detection',
        price: 19,
        category: 'software'
      },
      {
        id: 'multipoint-advanced',
        name: 'Advanced Multipoint Connection',
        description: 'Connect to up to 5 devices simultaneously',
        price: 29,
        category: 'software'
      }
    ]
  },
  {
    id: 5,
    title: 'Exclusive Extras',
    description: 'Limited-time exclusive additions',
    addOns: [
      {
        id: 'membership-vip',
        name: 'VIP Membership (1 Year)',
        description: 'Priority support, exclusive discounts, and early access to new products',
        price: 99,
        category: 'membership',
        popular: true
      },
      {
        id: 'personalization',
        name: 'Custom Engraving',
        description: 'Personalize your headphones with custom engraving',
        price: 39,
        category: 'customization'
      },
      {
        id: 'gift-box',
        name: 'Premium Gift Box',
        description: 'Beautiful gift packaging perfect for special occasions',
        price: 29,
        category: 'packaging'
      }
    ]
  }
];

export const getAllAddOns = (): AddOn[] => {
  return checkoutSteps.flatMap(step => step.addOns);
};