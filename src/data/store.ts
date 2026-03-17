export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  stock: number;
  badge?: string;
  bgColor: string;
  brandColor: string;
  image: string;
  variants?: ProductVariant[];
}

export const categories = [
  { id: 'r6', name: 'Rainbow Six', color: '#3b82f6', icon: '🎯', description: 'Premium Rainbow Six Siege software, keys, and accounts' },
];

export const products: Product[] = [
  // All Cheats AI — now a single product with selectable variants, R6 branded
  {
    id: 'ac-keys',
    name: 'All Cheats AI Key',
    category: 'r6',
    price: 2.00,
    description: 'All Cheats AI is a downloadable software package built using AI technology. Includes AI aimbot, visual ESP, recoil control system, and other gameplay tools designed to improve performance and provide additional in-game awareness.',
    features: ['🤖 AI-Powered Aimbot', '👁 Visual ESP', '🔫 Recoil Control', '⚡ Instant Delivery', '🛡 Undetected Technology', '🎧 24/7 Support'],
    stock: 100,
    badge: 'POPULAR',
    bgColor: '#0a1628',
    brandColor: '#3b82f6',
    image: '',
    variants: [
      { id: 'ac-1day', name: '1 Day Key', price: 2.00, description: 'Use All Cheats AI for 1 day / 24 hours. Perfect for trying the software.', stock: 100 },
      { id: 'ac-7day', name: '7 Day Key', price: 7.00, description: 'Use All Cheats AI for 7 days / 1 week.', stock: 100 },
      { id: 'ac-30day', name: '30 Day Key', price: 15.00, description: 'Use All Cheats AI for 30 days / 1 month.', stock: 97, badge: 'POPULAR' },
      { id: 'ac-unlimited', name: 'Unlimited Key', price: 35.00, description: 'Lifetime access, never expires.', stock: 98, badge: 'BEST VALUE' },
    ],
  },
  // R6 Accounts
  { id: 'r6-unranked', name: 'R6 Unranked Account', category: 'r6', price: 4.00, description: 'Fresh unranked Rainbow Six Siege account ready to play.', features: ['⚡ Instant Delivery', '🎮 Level 50+', '📦 Safe & Fast', '🔑 Full Access'], stock: 45, bgColor: '#0a1628', brandColor: '#3b82f6', image: '' },
  { id: 'r6-ranked', name: 'R6 Ranked Account', category: 'r6', price: 8.00, description: 'Ranked ready R6 account with operators unlocked.', features: ['⚡ Ranked Ready', '🎮 Operators Included', '📦 Fast Delivery', '🔑 Full Access'], stock: 30, badge: 'HOT', bgColor: '#0a1628', brandColor: '#3b82f6', image: '' },
  { id: 'r6-smurf', name: 'R6 Smurf Account', category: 'r6', price: 6.00, description: 'Perfect smurf account for Rainbow Six Siege.', features: ['⚡ Instant Delivery', '🎮 Any Build', '📦 Safe Delivery', '✅ Verified'], stock: 25, bgColor: '#0a1628', brandColor: '#3b82f6', image: '' },
];

export const cities = [
  'Austin TX', 'Miami FL', 'Chicago IL', 'New York NY', 'Los Angeles CA',
  'Houston TX', 'Phoenix AZ', 'Dallas TX', 'Seattle WA', 'Denver CO',
  'Atlanta GA', 'Boston MA', 'San Diego CA', 'Portland OR', 'Detroit MI'
];

export const paymentMethods = [
  { id: 'cashapp', name: 'CashApp', handle: '$allcheats', color: '#00D632', icon: '💚' },
];

export const promoCodesDefault = [
  { code: 'ALLCHEATS10', type: 'percentage' as const, value: 10, active: true, uses: 0 },
  { code: 'SAVE5', type: 'fixed' as const, value: 5, active: true, uses: 0 },
];

export const adminAccountsDefault = [
  { id: '1', username: 'red', password: 'Allcheats.co', role: 'owner' as const, active: true, loginCount: 0, lastIp: '', lastLogin: '', ipLogs: [] as {ip: string; date: string}[] },
];
