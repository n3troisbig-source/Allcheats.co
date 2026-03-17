// ─── Order Store ─────────────────────────────────────────────────────────────
// Single source of truth for orders + customers.
// All reads/writes go through here so every tab stays in sync.

export interface Order {
  id: string;
  ticketId: string;
  email: string;
  name: string;
  product: string;
  variant: string;
  total: number;
  paymentMethod: 'CashApp';
  date: string;
  status: 'Pending' | 'Paid' | 'Cancelled';
}

export interface Customer {
  id: string;       // keyed by email
  name: string;
  email: string;
  balance: number;
  totalOrders: number;
  totalSpent: number;    // sum of Paid orders only
  joinDate: string;
}

const ORDERS_KEY = 'ac_orders';
const CUSTOMERS_KEY = 'ac_customers';
export const ORDER_EVENT = 'ac_orders_updated';

// ── helpers ───────────────────────────────────────────────────────────────────

function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function getOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  // fire custom event so any mounted component can re-read
  window.dispatchEvent(new CustomEvent(ORDER_EVENT));
}

export function placeOrder(params: {
  name: string;
  email: string;
  product: string;
  variant: string;
  total: number;
}): Order {
  const order: Order = {
    id: genId('ORD'),
    ticketId: genId('TKT'),
    email: params.email.trim().toLowerCase(),
    name: params.name.trim(),
    product: params.product,
    variant: params.variant,
    total: params.total,
    paymentMethod: 'CashApp',
    date: new Date().toISOString(),
    status: 'Pending',
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  // upsert customer
  upsertCustomer(order);

  return order;
}

export function updateOrderStatus(id: string, status: Order['status']) {
  const orders = getOrders().map((o) => (o.id === id ? { ...o, status } : o));
  saveOrders(orders);
  // rebuild customer totals after status change
  rebuildCustomers(orders);
}

// ── Customers ─────────────────────────────────────────────────────────────────

export function getCustomers(): Customer[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function upsertCustomer(order: Order) {
  const customers = getCustomers();
  const idx = customers.findIndex((c) => c.email === order.email);
  if (idx === -1) {
    customers.push({
      id: order.email,
      name: order.name,
      email: order.email,
      balance: 0,
      totalOrders: 1,
      totalSpent: 0, // only count when Paid
      joinDate: new Date().toISOString().split('T')[0],
    });
  } else {
    customers[idx].totalOrders += 1;
    // keep most recent name
    if (order.name) customers[idx].name = order.name;
  }
  saveCustomers(customers);
}

/** Recompute every customer's totalOrders + totalSpent from the order list */
export function rebuildCustomers(orders: Order[]) {
  const map = new Map<string, Customer>();

  // keep existing balance & joinDate
  getCustomers().forEach((c) => {
    map.set(c.email, { ...c, totalOrders: 0, totalSpent: 0 });
  });

  orders.forEach((o) => {
    let c = map.get(o.email);
    if (!c) {
      c = {
        id: o.email,
        name: o.name,
        email: o.email,
        balance: 0,
        totalOrders: 0,
        totalSpent: 0,
        joinDate: o.date.split('T')[0],
      };
      map.set(o.email, c);
    }
    c.totalOrders += 1;
    if (o.status === 'Paid') c.totalSpent += o.total;
    // keep most recent name
    if (o.name) c.name = o.name;
  });

  saveCustomers(Array.from(map.values()));
  window.dispatchEvent(new CustomEvent(ORDER_EVENT));
}

export function adjustCustomerBalance(email: string, delta: number) {
  const customers = getCustomers().map((c) =>
    c.email === email ? { ...c, balance: Math.max(0, c.balance + delta) } : c
  );
  saveCustomers(customers);
  window.dispatchEvent(new CustomEvent(ORDER_EVENT));
}
