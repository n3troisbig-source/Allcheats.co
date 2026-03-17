import { useEffect, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';

const CITIES = [
  'Texas', 'California', 'Florida', 'New York', 'Ohio', 'Georgia',
  'Illinois', 'Michigan', 'Arizona', 'Nevada', 'North Carolina',
  'Tennessee', 'Colorado', 'Washington', 'Virginia', 'Pennsylvania',
  'Missouri', 'Indiana', 'Oregon', 'Oklahoma',
];

const NAMES = [
  'Jake', 'Tyler', 'Mason', 'Dylan', 'Logan', 'Ethan', 'Noah',
  'Liam', 'Aiden', 'Caleb', 'Hunter', 'Ryan', 'Zach', 'Cole',
  'Alex', 'Jordan', 'Brandon', 'Derek', 'Marcus', 'Kevin',
];

const PRODUCTS = [
  { name: 'All Cheats AI', variant: '1 Day Key', price: '$2.00' },
  { name: 'All Cheats AI', variant: '7 Day Key', price: '$7.00' },
  { name: 'All Cheats AI', variant: '30 Day Key', price: '$15.00' },
  { name: 'All Cheats AI', variant: 'Unlimited Key', price: '$35.00' },
  { name: 'Acc Gen', variant: 'Perm Acc Gen', price: '$25.00' },
  { name: 'Acc Gen', variant: '5% Discount — 1 Week', price: '$5.00' },
  { name: 'Acc Gen', variant: 'Month Access', price: '$15.00' },
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePurchase() {
  return {
    id: Math.random().toString(36).slice(2),
    name: randomFrom(NAMES),
    city: randomFrom(CITIES),
    product: randomFrom(PRODUCTS),
    timeAgo: Math.floor(Math.random() * 8) + 1, // 1–8 mins ago
  };
}

export default function LiveFeed() {
  const [notification, setNotification] = useState(generatePurchase());
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Cycle a new notification every 6 seconds
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setNotification(generatePurchase());
        setVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(cycle);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 rounded-xl border border-dark-500 bg-dark-800/95 backdrop-blur-md px-4 py-3 shadow-2xl shadow-black/50 max-w-xs sm:max-w-sm">
        {/* Icon */}
        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-red-primary/20 border border-red-primary/30">
          <ShoppingBag className="h-4 w-4 text-red-light" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            <span className="text-red-light">{notification.name}</span>
            {' '}from{' '}
            <span className="text-gray-300">{notification.city}</span>
            {' '}just bought
          </p>
          <p className="text-xs text-gray-400 truncate">
            {notification.product.name} —{' '}
            <span className="text-green-400 font-semibold">{notification.product.variant}</span>
            {' '}·{' '}
            <span className="text-red-light font-bold">{notification.product.price}</span>
          </p>
          <p className="text-[10px] text-gray-600 mt-0.5">{notification.timeAgo} min ago</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-gray-600 hover:text-gray-400 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
