// Re-export Order + Customer from the live order store
export type { Order, Customer } from './orderStore';

export interface Variant {
  name: string;
  price: string;
  description: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  status: string;
  description: string;
  longDescription: string;
  startingPrice: string;
  totalStock: number;
  image: string;
  tag?: string;
  notice?: string;
  variants: Variant[];
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  amount: number;
  active: boolean;
  usageCount: number;
}

export interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  active: boolean;
  createdAt: string;
}

export interface IpLog {
  id: string;
  username: string;
  role: string;
  ip: string;
  timestamp: string;
}

export const defaultProducts: Product[] = [
  {
    id: 'p1',
    name: 'All Cheats AI',
    status: 'Working',
    description: 'DOWNLOAD!',
    longDescription:
      'All Cheats AI is a downloadable software package built using AI technology. It includes features such as an AI aimbot, visual ESP, a recoil control system, and other gameplay tools. The software is designed to improve performance and provide additional in-game awareness. The product is available with different key lengths so users can choose how long they want access.',
    startingPrice: '$2.00',
    totalStock: 100,
    image: '🎯',
    tag: 'POPULAR',
    variants: [
      { name: '1 Day Key 🔒', price: '$2.00', description: 'Use All Cheats AI for 1 day / 24 hours. Try the software and see if it is worth buying long term.', stock: 100 },
      { name: '7 Day Key 🔒', price: '$7.00', description: 'Use All Cheats AI for 7 days / 1 week.', stock: 100 },
      { name: '30 Day Key 🔒', price: '$15.00', description: 'Use All Cheats AI for 30 days / 1 month.', stock: 97 },
      { name: 'Unlimited Key 🔒', price: '$35.00', description: 'Use All Cheats AI forever / lifetime access with no expiration.', stock: 98 },
    ],
  },
  {
    id: 'p2',
    name: 'Acc Gen',
    status: 'Working',
    description: 'Account Generator',
    longDescription:
      'Generate R6 game accounts instantly. Our Acc Gen delivers permanent accounts with full credentials after payment. All accounts are luck-based — you can potentially receive a Champ, Diamond, Emerald, or any rank. NO specific rank is guaranteed. What rank you get is entirely up to luck. Choose from a permanent account, a week discount, or month access.',
    startingPrice: '$5.00',
    totalStock: 99,
    image: '⚡',
    tag: 'ACC GEN',
    notice: '🍀 ALL LUCK — You may receive any rank (Champ, Diamond, Emerald, Plat, etc). No specific rank is guaranteed whatsoever.',
    variants: [
      { name: 'Perm Acc Gen 🔒', price: '$25.00', description: 'Permanent generated R6 account. Yours to keep forever. Full credentials included. Rank is ALL LUCK — could be anything.', stock: 99 },
      { name: '5% Discount — 1 Week 🔒', price: '$5.00', description: 'Get a 5% discount on any acc gen purchase valid for 1 week.', stock: 99 },
      { name: 'Month Access 🔒', price: '$15.00', description: '30-day account access. Great for extended use. Rank is ALL LUCK — no rank guaranteed.', stock: 99 },
    ],
  },
];

// No fake default orders — orders come from real customer purchases
export const defaultOrders = [] as import('./orderStore').Order[];

export const defaultPromoCodes: PromoCode[] = [
  { id: 'pr1', code: 'SAVE20', type: 'percentage', amount: 20, active: true, usageCount: 0 },
  { id: 'pr2', code: 'FIRST5', type: 'fixed', amount: 5, active: true, usageCount: 0 },
];

export const defaultAnnouncements: Announcement[] = [
  { id: 'an1', message: '🔥 New stock available! All Cheats AI keys restocked! Acc Gen live — Perm accounts available. ALL LUCK on rank — could be Champ, Diamond, Emerald or anything!', type: 'success', active: true, createdAt: new Date().toISOString() },
];

// No fake customers — derived from real orders
export const defaultCustomers = [] as import('./orderStore').Customer[];
