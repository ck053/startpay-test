// Shared item definitions without secrets
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

// Items data - shared between frontend and backend
export const ITEMS: Item[] = [
  {
    id: 'ice_cream',
    name: 'Ice Cream 🍦',
    description: 'A delicious virtual ice cream',
    price: 1,
    icon: '🍦'
  },
  {
    id: 'cookie',
    name: 'Cookie 🍪',
    description: 'A sweet virtual cookie',
    price: 3,
    icon: '🍪'
  },
  {
    id: 'hamburger',
    name: 'Hamburger 🍔',
    description: 'A tasty virtual hamburger',
    price: 5,
    icon: '🍔'
  },
  {
    id: 'fries',
    name: 'Fries 🍟',
    description: 'A tasty virtual Fries',
    price: 4,
    icon: '🍟'
  }
];

// Helper function to get item by ID
export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id);
} 