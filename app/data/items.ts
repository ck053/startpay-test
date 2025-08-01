export interface Item {
  id: string;
  gift_id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
}

export const ITEMS: Item[] = [
  {
    id: 'heart',
    gift_id: '5170145012310081615',
    name: 'Heart 💝',
    description: 'Send love and affection',
    price: 15,
    icon: ' 💝 '
  },
  {
    id: 'bear',
    gift_id: '5170233102089322756',
    name: 'Bear 🧸',
    description: 'A cute teddy bear gift',
    price: 15,
    icon: ' 🧸 '
  },
  {
    id: 'gift',
    gift_id: '5170250947678437525',
    name: 'Gift 🎁',
    description: 'A special present for someone',
    price: 25,
    icon: ' 🎁 '
  },
  {
    id: 'rose',
    gift_id: '5168103777563050263',
    name: 'Rose 🌹',
    description: 'A beautiful rose for your loved one',
    price: 25,
    icon: ' 🌹 '
  },
  {
    id: 'cake',
    gift_id: '5170144170496491616',
    name: 'Cake 🎂',
    description: 'Celebrate with a delicious cake',
    price: 50,
    icon: ' 🎂 '
  },
  {
    id: 'bouquet',
    gift_id: '5170314324215857265',
    name: 'Bouquet 💐',
    description: 'A lovely flower arrangement',
    price: 50,
    icon: ' 💐 '
  },
  {
    id: 'rocket',
    gift_id: '5170564780938756245',
    name: 'Rocket 🚀',
    description: 'Blast off with this exciting gift',
    price: 50,
    icon: ' 🚀 '
  },
  {
    id: 'champagne',
    gift_id: '6028601630662853006',
    name: 'Champagne 🍾',
    description: 'Celebrate in style with bubbly',
    price: 50,
    icon: ' 🍾 '
  },
  {
    id: 'trophy',
    gift_id: '5168043875654172773',
    name: 'Trophy 🏆',
    description: 'Award someone for their achievements',
    price: 100,
    icon: ' 🏆 '
  },
  {
    id: 'ring',
    gift_id: '5170690322832818290',
    name: 'Ring 💍',
    description: 'A precious ring for someone special',
    price: 100,
    icon: ' 💍 '
  },
  {
    id: 'diamond',
    gift_id: '5170521118301225164',
    name: 'Diamond 💎',
    description: 'The ultimate sparkling gift',
    price: 100,
    icon: ' 💎 '
  }
];

// Helper function to get item by ID
export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id);
}
