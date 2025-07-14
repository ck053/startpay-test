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
    id: 'one_coin',
    name: 'One Coin 🪙',
    description: 'One in-game coin',
    price: 1,
    icon: ' 🪙 '
  },
  {
    id: 'five_coins',
    name: 'Five Coins 🪙',
    description: 'Five in_game coins',
    price: 4,
    icon: '🪙'
  },
  {
    id: 'ten_coins',
    name: 'Ten Coins 🪙',
    description: 'Ten in-game coins',
    price: 7,
    icon: '🪙'
  },
  {
    id: 'treasure',
    name: 'Treasure 🎁',
    description: 'A mystery box',
    price: 5,
    icon: '🎁'
  }
];

// Helper function to get item by ID
export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id);
} 
