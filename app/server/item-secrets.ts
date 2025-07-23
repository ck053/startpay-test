// This file is only used on the server side and contains sensitive information
// that should not be exposed to the client

// Map of item IDs to their secret codes
export const ITEM_SECRETS: Record<string, string> = {
  'one_coin': 'onecoin2025',
  'five_coins': 'fivecoin2025',
  'ten_coins': 'tencoin2025',
  'treasure': 'treasure2025'
};

export const ITEM_VALUE: Record<string, number> = {
  'one_coin': 1,
  'five_coins': 5,
  'ten_coins': 10,
  'treasure': 0
};

// Function to get a secret code for an item
export function getSecretForItem(itemId: string): string | undefined {
  return ITEM_SECRETS[itemId];
}

export function getValueForItem(itemId: string): number | undefined {
  return ITEM_VALUE[itemId];
}
