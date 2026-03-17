import { useState, useEffect, useRef, useCallback } from 'react';
import { products as defaultProducts, categories, cities, paymentMethods, promoCodesDefault, adminAccountsDefault, type Product, type ProductVariant } from './data/store';

// ─── Types ───
interface CartItem { product: Product; quantity: number; variant?: ProductVariant }
interface Order { id: string; ticketId: string; email: string; items: CartItem[]; total: number; paymentMethod: string; status: 'pending' | 'paid' | 'cancelled'; date: string }
interface Announcement { id: string; text: string; type: 'info' | 'success' | 'warning' | 'promo'; active: boolean; date: string }
interface PromoCode { code: string; type: 'percentage' | 'fixed'; value: number; active: boolean; uses: number }
interface AdminAccount { id: string; username: string; password: string; role: 'owner' | 'manager' | 'staff'; active: boolean; loginCount: number; lastIp: string; lastLogin: string; ipLogs: { ip: string; date: string }[] }
interface Customer { id: string; name: string; email: string; password: string; balance: number; totalOrders: number; totalSpent: number; memberSince: string; orders: Order[] }

const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatPrice = (p: number) => p.toFixed(2);

function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaultValue; } catch { return defaultValue; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

// Crosshair SVG Logo
function CrosshairLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" stroke="#ef1e1e" strokeWidth="1.5"/>
      <line x1="16" y1="2" x2="16" y2="10" stroke="#ef1e1e" strokeWidth="1.5"/>
      <line x1="16" y1="22" x2="16" y2="30" stroke="#ef1e1e" strokeWidth="1.5"/>
      <line x1="2" y1="16" x2="10" y2="16" stroke="#ef1e1e" strokeWidth="1.5"/>
      <line x1="22" y1="16" x2="30" y2="16" stroke="#ef1e1e" strokeWidth="1.5"/>
      <rect x="12" y="12" width="8" height="8" stroke="#ef1e1e" strokeWidth="1" fill="rgba(239,30,30,0.15)"/>
    </svg>
  );
}

export default function App() {
  const [page, setPage] = useState<string>('home');
  const [cart, setCart] = useLocalStorage<CartItem[]>('ac-cart', []);
  const [orders, setOrders] = useLocalStorage<Order[]>('ac-orders', []);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('ac-announcements', []);
  const [promoCodes, setPromoCodes] = useLocalStorage<PromoCode[]>('ac-promos', promoCodesDefault);
  const [adminAccounts, setAdminAccounts] = useLocalStorage<AdminAccount[]>('ac-admins', adminAccountsDefault);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('ac-customers', []);
  const [products, setProducts] = useLocalStorage<Product[]>('ac-products', defaultProducts);
  const [visitorCount, setVisitorCount] = useState(rand(8, 40));
  const [notification, setNotification] = useState<{ product: string; city: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminAccount | null>(null);
  const [customerUser, setCustomerUser] = useLocalStorage<Customer | null>('ac-customer', null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setVisitorCount(rand(8, 40)), rand(20000, 40000));
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const showNotif = () => {
      const p = products[rand(0, products.length - 1)];
      const c = cities[rand(0, cities.length - 1)];
      const displayName = p.variants ? p.variants[rand(0, p.variants.length - 1)].name : p.name;
      setNotification({ product: displayName, city: c });
      setTimeout(() => setNotification(null), 5000);
    };
    const interval = setInterval(showNotif, rand(15000, 45000));
    setTimeout(showNotif, 5000);
    return () => clearInterval(interval);
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animate-in'); });
      }, { threshold: 0.1 });
      document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [page, selectedProduct]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    setCart(prev => {
      const cartId = variant ? variant.id : product.id;
      const existing = prev.find(i => (i.variant?.id || i.product.id) === cartId);
      if (existing) return prev.map(i => (i.variant?.id || i.product.id) === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1, variant }];
    });
  }, [setCart]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const scrollTo = (id: string) => {
    setPage('home');
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Barlow', sans-serif" }}>
      <Navbar visitorCount={visitorCount} cartCount={cartCount} setPage={setPage} scrollTo={scrollTo}
        setAdminOpen={setAdminOpen} customerUser={customerUser} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {notification && (
        <div className="animate-slideIn" style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 50, maxWidth: 300 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-bright)', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} className="animate-pulse" />
              {notification.city}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Barlow Condensed, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {notification.product} purchased
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
              {rand(1, 5)}m ago
            </div>
          </div>
        </div>
      )}

      {page === 'home' && (
        <>
          <Hero scrollTo={scrollTo} />
          <StatsBar />
          <FeaturedProduct products={products} setPage={setPage} setSelectedProduct={(p) => { setSelectedProduct(p); setPage('product-detail'); }} />
          <FeaturesSection />
          <HowItWorks />
          <DiscordSection />
        </>
      )}
      {page === 'products' && (
        <ProductsPage products={products} addToCart={addToCart} setSelectedProduct={(p) => { setSelectedProduct(p); setPage('product-detail'); }} />
      )}
      {page === 'product-detail' && selectedProduct && (
        <ProductDetail product={selectedProduct} addToCart={addToCart} products={products} setSelectedProduct={(p) => { setSelectedProduct(p); }} goBack={() => setPage('products')} />
      )}
      {page === 'cart' && <CartPage cart={cart} setCart={setCart} setPage={setPage} promoCodes={promoCodes} />}
      {page === 'checkout' && (
        <CheckoutPage cart={cart} setCart={setCart} setPage={setPage} promoCodes={promoCodes} orders={orders} setOrders={setOrders} customers={customers} setCustomers={setCustomers} customerUser={customerUser} />
      )}
      {page === 'login' && <CustomerAuth customers={customers} setCustomers={setCustomers} setCustomerUser={setCustomerUser} setPage={setPage} />}
      {page === 'dashboard' && <CustomerDashboard customer={customerUser} setCustomerUser={setCustomerUser} setPage={setPage} />}

      <Footer setPage={setPage} />

      {adminOpen && (
        <AdminPanel adminUser={adminUser} setAdminUser={setAdminUser} adminAccounts={adminAccounts} setAdminAccounts={setAdminAccounts}
          orders={orders} setOrders={setOrders} announcements={announcements} setAnnouncements={setAnnouncements}
          promoCodes={promoCodes} setPromoCodes={setPromoCodes} products={products} setProducts={setProducts}
          customers={customers} setCustomers={setCustomers} onClose={() => setAdminOpen(false)} />
      )}
    </div>
  );
}

// ━━━━ NAVBAR ━━━━
function Navbar({ visitorCount, cartCount, setPage, scrollTo, setAdminOpen, customerUser, mobileMenuOpen, setMobileMenuOpen }: any) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(7,7,8,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <button onClick={() => setPage('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <CrosshairLogo size={28} />
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text)' }}>
            All<span style={{ color: 'var(--red)' }}>Cheats</span>.co
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="hidden-mobile">
          {[
            { label: 'Home', action: () => setPage('home') },
            { label: 'Products', action: () => setPage('products') },
            { label: 'Features', action: () => scrollTo('features') },
            { label: 'Discord', action: () => window.open('https://discord.gg/7QxUqzar', '_blank') },
          ].map(l => (
            <button key={l.label} onClick={l.action} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-dim)', transition: 'color 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
              {l.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} className="animate-pulse" />
            {visitorCount} ONLINE
          </div>

          <button onClick={() => setPage('cart')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16,
                background: 'var(--red)', fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>{cartCount}</span>
            )}
          </button>

          {customerUser ? (
            <button onClick={() => setPage('dashboard')} style={{
              width: 32, height: 32, background: 'var(--red)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
            }}>{customerUser.name[0].toUpperCase()}</button>
          ) : (
            <button onClick={() => setPage('login')} className="btn-ghost btn-sm">Login</button>
          )}

          <button onClick={() => setAdminOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
            title="Admin"
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-dim)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'none' }} className="show-mobile">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>

      {mobileMenuOpen && (
        <div style={{ background: 'rgba(7,7,8,0.98)', borderTop: '1px solid var(--border)', padding: '16px 32px' }}>
          {['Home', 'Products', 'Features', 'Discord'].map(l => (
            <button key={l} onClick={() => {
              if (l === 'Products') setPage('products');
              else if (l === 'Discord') window.open('https://discord.gg/7QxUqzar', '_blank');
              else if (l === 'Features') scrollTo('features');
              else setPage('home');
              setMobileMenuOpen(false);
            }} style={{
              display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
              borderBottom: '1px solid var(--border)', padding: '14px 0', cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--text-dim)'
            }}>{l}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ━━━━ HERO ━━━━
function Hero({ scrollTo }: { scrollTo: (id: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; da: number }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, size: Math.random() * 1.5 + 0.3, alpha: Math.random(), da: (Math.random() - 0.5) * 0.006 });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.alpha += p.da;
        if (p.alpha <= 0 || p.alpha >= 1) p.da *= -1;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 30, 30, ${p.alpha * 0.5})`; ctx.fill();
        particles.forEach((p2, j) => {
          if (j <= i) return;
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(239, 30, 30, ${(1 - dist / 120) * 0.07})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Grid overlay */}
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      {/* Red glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(239,30,30,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Corner accents on the hero */}
      <div style={{ position: 'absolute', top: 80, left: 32, width: 60, height: 60, borderTop: '1px solid rgba(239,30,30,0.4)', borderLeft: '1px solid rgba(239,30,30,0.4)' }} />
      <div style={{ position: 'absolute', top: 80, right: 32, width: 60, height: 60, borderTop: '1px solid rgba(239,30,30,0.4)', borderRight: '1px solid rgba(239,30,30,0.4)' }} />
      <div style={{ position: 'absolute', bottom: 80, left: 32, width: 60, height: 60, borderBottom: '1px solid rgba(239,30,30,0.4)', borderLeft: '1px solid rgba(239,30,30,0.4)' }} />
      <div style={{ position: 'absolute', bottom: 80, right: 32, width: 60, height: 60, borderBottom: '1px solid rgba(239,30,30,0.4)', borderRight: '1px solid rgba(239,30,30,0.4)' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%' }} className="animate-pulse" />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            System Operational — v2.4.1
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="font-display" style={{ fontSize: 'clamp(72px, 14vw, 140px)', lineHeight: 0.9, color: 'var(--red)', marginBottom: 4 }}>ALL</div>
          <div className="font-display" style={{ fontSize: 'clamp(72px, 14vw, 140px)', lineHeight: 0.9, color: 'var(--text)', WebkitTextStroke: '1px rgba(255,255,255,0.2)', marginBottom: 4 }}>CHEATS</div>
          <div className="font-display" style={{ fontSize: 'clamp(72px, 14vw, 140px)', lineHeight: 0.9, color: 'var(--text-muted)' }}>.CO</div>
        </div>

        <p style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 300, fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--text-dim)', maxWidth: 500, margin: '28px auto 40px', lineHeight: 1.7 }}>
          Next-generation AI gaming software. Aimbot. ESP. Recoil Control.
          <br />Instant delivery. Undetected tech.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <button onClick={() => scrollTo('products-section')} className="btn-red" style={{ fontSize: 14, padding: '14px 36px' }}>
            View Products
          </button>
          <button onClick={() => window.open('https://discord.gg/7QxUqzar', '_blank')} className="btn-ghost" style={{ fontSize: 14, padding: '14px 36px' }}>
            Join Discord
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[
            { value: '500+', label: 'Customers Served' },
            { value: '99.9%', label: 'Undetected Rate' },
            { value: '24/7', label: 'Support' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: 28, color: 'var(--red)' }}>{s.value}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to top, var(--bg), transparent)' }} />

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Scroll</div>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }} />
      </div>
    </section>
  );
}

// ━━━━ STATS BAR ━━━━
function StatsBar() {
  const stats = [
    { value: '500+', label: 'Customers Served', icon: '◆' },
    { value: '99.9%', label: 'Undetected Rate', icon: '◆' },
    { value: '24/7', label: 'Support Available', icon: '◆' },
    { value: '$2', label: 'Starting Price', icon: '◆' },
  ];
  return (
    <section style={{ padding: '0 32px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
          {stats.map(s => (
            <div key={s.label} className="fade-up" style={{ padding: '32px 28px', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: 36, color: 'var(--text)', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━━ FEATURED PRODUCT ━━━━
function FeaturedProduct({ products, setPage, setSelectedProduct }: any) {
  const mainProduct = products.find((p: Product) => p.id === 'ac-keys');
  const features = ['AI-Powered Aimbot', 'Visual ESP', 'Recoil Control', 'Instant Delivery', 'Undetected Tech', '24/7 Support'];

  return (
    <section id="products-section" style={{ padding: '80px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="fade-up" style={{ marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Featured Software</div>
          <div className="font-display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1 }}>Our Flagship<br/><span style={{ color: 'var(--red)' }}>Product</span></div>
        </div>

        {mainProduct && (
          <div className="fade-up card" onClick={() => setSelectedProduct(mainProduct)}
            style={{ display: 'flex', overflow: 'hidden', cursor: 'pointer', flexWrap: 'wrap' }}>
            <div className="corner-accent corner-tl" /><div className="corner-accent corner-tr" />
            <div className="corner-accent corner-bl" /><div className="corner-accent corner-br" />

            {/* Image panel */}
            <div className="grid-pattern" style={{ width: 320, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(239,30,30,0.08) 0%, transparent 70%)' }} />
              <CrosshairLogo size={80} />
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', gap: 8 }}>
                <span className="badge badge-green"><span className="animate-pulse" style={{ width: 5, height: 5, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />Working</span>
                <span className="badge badge-red">Popular</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '40px 48px', minWidth: 280 }}>
              <div className="font-display" style={{ fontSize: 36, marginBottom: 16, lineHeight: 1 }}>All Cheats AI</div>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                A downloadable software package built using AI technology. Includes AI aimbot, visual ESP, recoil control, and other gameplay tools.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 20px', marginBottom: 36 }}>
                {features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-dim)' }}>
                    <span style={{ color: 'var(--green)', fontSize: 10 }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                <div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Starting from </span>
                  <span className="font-display" style={{ fontSize: 32, color: 'var(--red)', marginLeft: 6 }}>$2.00</span>
                </div>
                <button className="btn-red btn-sm">View Options →</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 40 }} className="fade-up">
          <button onClick={() => setPage('products')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            View all products →
          </button>
        </div>
      </div>
    </section>
  );
}

// ━━━━ FEATURES ━━━━
function FeaturesSection() {
  const features = [
    { num: '01', title: 'AI Aimbot', desc: 'Advanced AI targeting system that locks onto enemies with surgical precision.' },
    { num: '02', title: 'Visual ESP', desc: 'See enemy positions through walls with our real-time visual overlay system.' },
    { num: '03', title: 'Recoil Control', desc: 'Automatic compensation for perfect spray control on every weapon.' },
    { num: '04', title: 'Instant Delivery', desc: 'Your access key delivered the moment your purchase is confirmed.' },
    { num: '05', title: 'Undetected', desc: 'Built to stay completely under the radar of all anti-cheat systems.' },
    { num: '06', title: 'AI Powered', desc: 'Machine learning algorithms that adapt to your unique gameplay style.' },
  ];
  return (
    <section id="features" style={{ padding: '80px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="fade-up" style={{ marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Capabilities</div>
          <div className="font-display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1 }}>What's<br/><span style={{ color: 'var(--red)' }}>Included</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {features.map(f => (
            <div key={f.num} className="fade-up" style={{
              padding: '32px 28px', background: 'var(--bg2)', border: '1px solid var(--border)',
              position: 'relative', cursor: 'default', transition: 'background 0.2s, border-color 0.2s'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,30,30,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
              <div className="font-display" style={{ fontSize: 64, color: 'rgba(239,30,30,0.08)', lineHeight: 1, position: 'absolute', top: 16, right: 20 }}>{f.num}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>{f.num}</div>
              <div className="font-display" style={{ fontSize: 22, marginBottom: 12 }}>{f.title}</div>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━━ HOW IT WORKS ━━━━
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Choose Your Plan', desc: 'Select the key duration that works best for you — from 1 day to unlimited.' },
    { num: '02', title: 'Complete Payment', desc: 'Send payment via CashApp to $allcheats. Simple and instant.' },
    { num: '03', title: 'Get Your Key', desc: 'Receive your license key immediately after payment confirmation.' },
  ];
  return (
    <section style={{ padding: '80px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="fade-up" style={{ marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Process</div>
          <div className="font-display" style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1 }}>How It<br/><span style={{ color: 'var(--red)' }}>Works</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
          {steps.map((s, i) => (
            <div key={s.num} className="fade-up" style={{ padding: '40px 36px', background: 'var(--bg2)', border: '1px solid var(--border)', position: 'relative' }}>
              <div className="font-display" style={{ fontSize: 96, lineHeight: 0.8, color: 'rgba(239,30,30,0.06)', position: 'absolute', top: 20, right: 20 }}>{s.num}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 24 }}>Step {i + 1}</div>
              <div className="font-display" style={{ fontSize: 26, marginBottom: 16 }}>{s.title}</div>
              <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)', zIndex: 2, fontFamily: 'JetBrains Mono, monospace', color: 'var(--red)', fontSize: 18, display: 'none' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ━━━━ DISCORD ━━━━
function DiscordSection() {
  return (
    <section style={{ padding: '80px 32px 120px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="fade-up card" style={{ padding: '64px', textAlign: 'center', borderColor: 'rgba(88,101,242,0.25)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(88,101,242,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div className="corner-accent corner-tl" style={{ borderColor: '#5865F2' }} />
          <div className="corner-accent corner-tr" style={{ borderColor: '#5865F2' }} />
          <div className="corner-accent corner-bl" style={{ borderColor: '#5865F2' }} />
          <div className="corner-accent corner-br" style={{ borderColor: '#5865F2' }} />

          <div className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1, marginBottom: 20 }}>Join Our<br/><span style={{ color: '#5865F2' }}>Community</span></div>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, maxWidth: 440, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Get support, stay updated on new releases, and connect with thousands of users.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
            {[['Support', '🎧'], ['Updates', '📢'], ['Community', '👥']].map(([label, icon]) => (
              <div key={label} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                {icon} {label}
              </div>
            ))}
          </div>
          <button onClick={() => window.open('https://discord.gg/7QxUqzar', '_blank')} style={{
            padding: '14px 40px', background: '#5865F2', color: '#fff', border: 'none', cursor: 'pointer',
            fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            transition: 'opacity 0.2s'
          }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Join Discord →
          </button>
        </div>
      </div>
    </section>
  );
}

// ━━━━ PRODUCTS PAGE ━━━━
function ProductsPage({ products, addToCart, setSelectedProduct }: any) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');

  let filtered = [...products];
  if (search) filtered = filtered.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'price-low') filtered = filtered.sort((a: Product, b: Product) => a.price - b.price);
  else if (sort === 'price-high') filtered = filtered.sort((a: Product, b: Product) => b.price - a.price);
  else if (sort === 'name') filtered = filtered.sort((a: Product, b: Product) => a.name.localeCompare(b.name));

  return (
    <section style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 56, paddingBottom: 48, borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Catalog</div>
          <div className="font-display" style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1, marginBottom: 16 }}>All<br/><span style={{ color: 'var(--red)' }}>Products</span></div>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, maxWidth: 460 }}>Premium Rainbow Six Siege software, keys, and accounts</p>
        </div>

        {/* Search + Sort */}
        <div className="fade-up" style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field" style={{ paddingLeft: 38 }} />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input-field" style={{ width: 'auto', background: 'var(--bg3)', cursor: 'pointer' }}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name">Name A → Z</option>
          </select>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}>
          {filtered.map((p: Product) => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} onClick={() => setSelectedProduct(p)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div className="font-display" style={{ fontSize: 48, marginBottom: 12 }}>—</div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>No products found</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 80, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Made by Death</div>
      </div>
    </section>
  );
}

// ━━━━ PRODUCT CARD ━━━━
function ProductCard({ product, addToCart, onClick }: { product: Product; addToCart: (p: Product, v?: ProductVariant) => void; onClick: () => void }) {
  const p = product;
  const hasVariants = p.variants && p.variants.length > 0;
  const badgeClass: Record<string, string> = {
    POPULAR: 'badge-red', BESTSELLER: 'badge-amber', HOT: 'badge-red', NEW: 'badge-green', 'BEST VALUE': 'badge-purple', PREMIUM: 'badge-purple'
  };

  return (
    <div className="fade-up" onClick={onClick} style={{
      background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer', position: 'relative',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,30,30,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px -8px rgba(239,30,30,0.15)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>

      {/* Image panel */}
      <div className="grid-pattern" style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(239,30,30,0.06), transparent 70%)' }} />
        <CrosshairLogo size={56} />
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          {p.badge && <span className={`badge ${badgeClass[p.badge] || 'badge-red'}`}>{p.badge}</span>}
        </div>
        {hasVariants && (
          <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
            <span className="badge badge-blue">{p.variants!.length} options</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '24px 24px 20px' }}>
        <div className="font-display" style={{ fontSize: 20, marginBottom: 12 }}>{p.name}</div>
        <div style={{ marginBottom: 20 }}>
          {p.features.slice(0, 3).map(f => (
            <div key={f} style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'Barlow, sans-serif' }}>{f}</div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div>
            {hasVariants ? (
              <>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>From</div>
                <div className="font-display" style={{ fontSize: 24, color: 'var(--red)' }}>
                  ${formatPrice(Math.min(...p.variants!.map(v => v.price)))}
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 4 }}>— ${formatPrice(Math.max(...p.variants!.map(v => v.price)))}</span>
                </div>
              </>
            ) : (
              <div className="font-display" style={{ fontSize: 28, color: 'var(--red)' }}>${formatPrice(p.price)}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span style={{ width: 5, height: 5, background: 'var(--green)', borderRadius: '50%' }} />
              {p.stock} In Stock
            </div>
          </div>
          <button className="btn-red btn-sm" onClick={e => { e.stopPropagation(); if (hasVariants) onClick(); else addToCart(p); }}>
            {hasVariants ? 'Options' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━ PRODUCT DETAIL ━━━━
function ProductDetail({ product, addToCart, products, setSelectedProduct, goBack }: any) {
  const [viewers] = useState(rand(2, 12));
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const related = products.filter((p: Product) => p.id !== product.id).slice(0, 3);
  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const badgeClass: Record<string, string> = { POPULAR: 'badge-red', BESTSELLER: 'badge-amber', 'BEST VALUE': 'badge-purple', PREMIUM: 'badge-purple' };

  return (
    <section style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 40, display: 'flex', alignItems: 'center', gap: 8 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
          ← Back to Products
        </button>

        <div className="fade-up" style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Image panel */}
          <div className="grid-pattern" style={{ width: 380, minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(239,30,30,0.07), transparent 70%)' }} />
            <CrosshairLogo size={100} />
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6 }}>
              <span className="badge badge-green"><span style={{ width: 5, height: 5, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} className="animate-pulse" />Active</span>
            </div>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <span className="badge badge-blue">{viewers} viewing</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, padding: '40px 48px', background: 'var(--bg2)', border: '1px solid var(--border)', minWidth: 280 }}>
            <span className="badge badge-blue" style={{ marginBottom: 16, display: 'inline-flex' }}>Rainbow Six</span>
            <div className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1, marginBottom: 16 }}>{product.name}</div>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.75, marginBottom: 28 }}>{product.description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              {product.features.map((f: string) => (
                <span key={f} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-dim)', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '5px 12px' }}>{f}</span>
              ))}
            </div>

            {/* Variant Selector */}
            {hasVariants && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Select Duration</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {product.variants!.map((v: ProductVariant) => (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} style={{
                      padding: '16px', textAlign: 'left', background: selectedVariant?.id === v.id ? 'rgba(239,30,30,0.08)' : 'var(--bg3)',
                      border: `1px solid ${selectedVariant?.id === v.id ? 'rgba(239,30,30,0.4)' : 'var(--border)'}`,
                      cursor: 'pointer', position: 'relative', transition: 'all 0.15s'
                    }}>
                      {v.badge && <span className={`badge ${badgeClass[v.badge] || 'badge-blue'}`} style={{ position: 'absolute', top: 8, right: 8 }}>{v.badge}</span>}
                      <div className="font-display" style={{ fontSize: 16, marginBottom: 4, color: selectedVariant?.id === v.id ? 'var(--red)' : 'var(--text)' }}>{v.name}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{v.description}</div>
                      <div className="font-display" style={{ fontSize: 20, color: 'var(--red)' }}>${formatPrice(v.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price + CTA */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                <div className="font-display" style={{ fontSize: 40, color: 'var(--red)' }}>${formatPrice(displayPrice)}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, background: 'var(--green)', borderRadius: '50%' }} />{displayStock} In Stock
                </div>
              </div>
              <button onClick={() => addToCart(product, selectedVariant || undefined)} className="btn-red" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '16px 0' }}>
                Add to Cart {selectedVariant ? `— ${selectedVariant.name}` : ''}
              </button>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 80 }} className="fade-up">
            <div className="section-label" style={{ marginBottom: 24 }}>You May Also Like</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {related.map((p: Product) => (
                <ProductCard key={p.id} product={p} addToCart={addToCart} onClick={() => { setSelectedProduct(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ━━━━ CART ━━━━
function CartPage({ cart, setCart, setPage, promoCodes }: any) {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');

  const getItemPrice = (item: CartItem) => (item.variant ? item.variant.price : item.product.price) * item.quantity;
  const getItemName = (item: CartItem) => item.variant ? `${item.product.name} — ${item.variant.name}` : item.product.name;
  const getItemId = (item: CartItem) => item.variant?.id || item.product.id;
  const subtotal = cart.reduce((s: number, i: CartItem) => s + getItemPrice(i), 0);
  const discount = appliedPromo ? (appliedPromo.type === 'percentage' ? subtotal * appliedPromo.value / 100 : appliedPromo.value) : 0;
  const total = Math.max(0, subtotal - discount);

  const applyPromo = () => {
    const code = promoCodes.find((c: PromoCode) => c.code.toLowerCase() === promoInput.toLowerCase() && c.active);
    if (code) { setAppliedPromo(code); setPromoError(''); }
    else { setPromoError('Invalid or inactive code'); setAppliedPromo(null); }
  };

  return (
    <section style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Items */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="font-display" style={{ fontSize: 40, marginBottom: 8 }}>Cart</div>
          {cart.length > 0 && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</div>}

          {cart.length === 0 ? (
            <div className="fade-up" style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="font-display" style={{ fontSize: 64, color: 'var(--text-muted)', marginBottom: 16 }}>—</div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 32 }}>Your cart is empty</p>
              <button onClick={() => setPage('products')} className="btn-red">Browse Products</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cart.map((item: CartItem) => (
                <div key={getItemId(item)} className="fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 44, height: 44, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CrosshairLogo size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-display" style={{ fontSize: 16, marginBottom: 2 }}>{getItemName(item)}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rainbow Six</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <button onClick={() => setCart((prev: CartItem[]) => prev.map((i: CartItem) => getItemId(i) === getItemId(item) ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                      style={{ width: 28, height: 28, background: 'var(--bg3)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ width: 36, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => setCart((prev: CartItem[]) => prev.map((i: CartItem) => getItemId(i) === getItemId(item) ? { ...i, quantity: i.quantity + 1 } : i))}
                      style={{ width: 28, height: 28, background: 'var(--bg3)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <div className="font-display" style={{ fontSize: 18, color: 'var(--red)', width: 72, textAlign: 'right' }}>${formatPrice(getItemPrice(item))}</div>
                  <button onClick={() => setCart((prev: CartItem[]) => prev.filter((i: CartItem) => getItemId(i) !== getItemId(item)))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {cart.length > 0 && (
          <div style={{ width: 320, flexShrink: 0, position: 'sticky', top: 88 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '28px' }}>
              <div className="font-display" style={{ fontSize: 20, marginBottom: 20 }}>Order Summary</div>
              <div style={{ marginBottom: 20 }}>
                {cart.map((i: CartItem) => (
                  <div key={getItemId(i)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{getItemName(i)} ×{i.quantity}</span>
                    <span style={{ flexShrink: 0 }}>${formatPrice(getItemPrice(i))}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={promoInput} onChange={e => setPromoInput(e.target.value)} placeholder="Promo code" className="input-field" style={{ flex: 1, fontSize: 12, padding: '10px 14px' }} />
                  <button onClick={applyPromo} className="btn-ghost btn-xs">Apply</button>
                </div>
                {appliedPromo && <div style={{ marginTop: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--green)' }}>✓ Code applied! -{appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : `$${appliedPromo.value}`}</div>}
                {promoError && <div style={{ marginTop: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)' }}>{promoError}</div>}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
                {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--green)', marginBottom: 6 }}><span>Discount</span><span>-${formatPrice(discount)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span className="font-display" style={{ fontSize: 18 }}>Total</span>
                  <span className="font-display" style={{ fontSize: 18, color: 'var(--red)' }}>${formatPrice(total)}</span>
                </div>
              </div>
              <button onClick={() => setPage('checkout')} className="btn-red" style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 13 }}>Proceed to Checkout</button>
            </div>
            <div style={{ marginTop: 2, background: 'var(--bg2)', border: '1px solid rgba(88,101,242,0.2)', padding: '20px 24px', textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: 14, marginBottom: 6 }}>Need Help?</div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>Join our Discord for support</p>
              <button onClick={() => window.open('https://discord.gg/7QxUqzar', '_blank')} style={{
                width: '100%', padding: '10px 0', background: '#5865F2', border: 'none', cursor: 'pointer',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
              }}>Join Discord</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ━━━━ CHECKOUT ━━━━
function CheckoutPage({ cart, setCart, setPage, promoCodes, setOrders, customerUser }: any) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(customerUser?.email || '');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [orderId, setOrderId] = useState('');
  const [ticketId, setTicketId] = useState('');

  const getItemPrice = (item: CartItem) => (item.variant ? item.variant.price : item.product.price) * item.quantity;
  const getItemName = (item: CartItem) => item.variant ? `${item.product.name} — ${item.variant.name}` : item.product.name;
  const subtotal = cart.reduce((s: number, i: CartItem) => s + getItemPrice(i), 0);
  const discount = appliedPromo ? (appliedPromo.type === 'percentage' ? subtotal * appliedPromo.value / 100 : appliedPromo.value) : 0;
  const total = Math.max(0, subtotal - discount);

  const completeOrder = () => {
    const oid = genId('ACO'); const tid = genId('ACO');
    setOrderId(oid); setTicketId(tid);
    const order: Order = { id: oid, ticketId: tid, email, items: cart, total, paymentMethod: selectedPayment, status: 'pending', date: new Date().toISOString() };
    setOrders((prev: Order[]) => [order, ...prev]);
    setCart([]); setStep(3);
  };

  if (cart.length === 0 && step < 3) return (
    <section style={{ paddingTop: 140, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div>
        <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>Your cart is empty</p>
        <button onClick={() => setPage('products')} className="btn-red">Browse Products</button>
      </div>
    </section>
  );

  const S = (n: number) => ({ bg: step >= n ? 'var(--red)' : 'var(--bg3)', border: step >= n ? 'var(--red)' : 'var(--border)', color: step >= n ? '#fff' : 'var(--text-muted)' });

  return (
    <section style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px' }}>
        {/* Progress */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 64 }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, background: S(s).bg, border: `1px solid ${S(s).border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S(s).color, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {s < step ? '✓' : s}
              </div>
              {i < 2 && <div style={{ width: 60, height: 1, background: step > s ? 'var(--red)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="fade-up" style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="font-display" style={{ fontSize: 32, marginBottom: 32 }}>Your Details</div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Email Address</div>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="input-field" />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Payment Method</div>
                {paymentMethods.map((pm: any) => (
                  <button key={pm.id} onClick={() => setSelectedPayment(pm.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px',
                    background: selectedPayment === pm.id ? 'rgba(239,30,30,0.06)' : 'var(--bg3)',
                    border: `1px solid ${selectedPayment === pm.id ? 'rgba(239,30,30,0.35)' : 'var(--border)'}`,
                    cursor: 'pointer', marginBottom: 8, transition: 'all 0.15s', textAlign: 'left'
                  }}>
                    <span style={{ fontSize: 22 }}>{pm.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div className="font-display" style={{ fontSize: 16, color: 'var(--text)' }}>{pm.name}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>{pm.handle}</div>
                    </div>
                    <div style={{ width: 18, height: 18, border: `2px solid ${selectedPayment === pm.id ? 'var(--red)' : 'var(--text-muted)'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selectedPayment === pm.id && <div style={{ width: 8, height: 8, background: 'var(--red)', borderRadius: '50%' }} />}
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <input value={promoInput} onChange={e => setPromoInput(e.target.value)} placeholder="Promo code" className="input-field" style={{ flex: 1, fontSize: 12 }} />
                <button onClick={() => { const c = promoCodes.find((c: PromoCode) => c.code.toLowerCase() === promoInput.toLowerCase() && c.active); if (c) setAppliedPromo(c); }} className="btn-ghost btn-xs">Apply</button>
              </div>
            </div>

            <div style={{ width: 280, flexShrink: 0 }}>
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '24px', position: 'sticky', top: 88 }}>
                <div className="font-display" style={{ fontSize: 18, marginBottom: 16 }}>Summary</div>
                <div style={{ marginBottom: 16 }}>
                  {cart.map((i: CartItem) => (
                    <div key={i.variant?.id || i.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 6 }}>{getItemName(i)} ×{i.quantity}</span>
                      <span style={{ flexShrink: 0 }}>${formatPrice(getItemPrice(i))}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)', marginBottom: 6 }}><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
                  {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--green)', marginBottom: 6 }}><span>Discount</span><span>-${formatPrice(discount)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <span className="font-display" style={{ fontSize: 16 }}>Total</span>
                    <span className="font-display" style={{ fontSize: 18, color: 'var(--red)' }}>${formatPrice(total)}</span>
                  </div>
                </div>
                <button disabled={!email || !selectedPayment} onClick={() => setStep(2)} className="btn-red" style={{ width: '100%', justifyContent: 'center', marginTop: 20, padding: '14px 0' }}>Continue →</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up" style={{ maxWidth: 440, margin: '0 auto' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '48px', textAlign: 'center', position: 'relative' }}>
              <div className="corner-accent corner-tl" /><div className="corner-accent corner-tr" />
              <div className="corner-accent corner-bl" /><div className="corner-accent corner-br" />
              <div className="font-display" style={{ fontSize: 28, marginBottom: 32 }}>Complete Payment</div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Send exactly</p>
              <div className="font-display" style={{ fontSize: 56, color: 'var(--red)', marginBottom: 32 }}>${formatPrice(total)}</div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700 }}>$allcheats</span>
                <button onClick={() => navigator.clipboard.writeText('$allcheats')} className="btn-ghost btn-xs">Copy</button>
              </div>
              <a href="https://cash.app/$allcheats" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginBottom: 20, padding: '12px 32px', background: '#00D632', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>Open CashApp</a>
              <div style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', padding: '12px 16px', marginBottom: 28 }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#eab308', letterSpacing: '0.06em' }}>⚠ Include your email in the payment note</p>
              </div>
              <button onClick={completeOrder} className="btn-red" style={{ width: '100%', justifyContent: 'center', padding: '16px 0', fontSize: 14 }}>I've Sent Payment</button>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, marginTop: 16, display: 'block', width: '100%', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Go Back</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-up" style={{ maxWidth: 440, margin: '0 auto' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(34,197,94,0.25)', padding: '48px', textAlign: 'center', position: 'relative' }}>
              <div className="corner-accent corner-tl" style={{ borderColor: 'var(--green)' }} />
              <div className="corner-accent corner-tr" style={{ borderColor: 'var(--green)' }} />
              <div className="corner-accent corner-bl" style={{ borderColor: 'var(--green)' }} />
              <div className="corner-accent corner-br" style={{ borderColor: 'var(--green)' }} />
              <div className="font-display" style={{ fontSize: 18, color: 'var(--green)', marginBottom: 12, letterSpacing: '0.15em' }}>ORDER CONFIRMED</div>
              <div className="font-display" style={{ fontSize: 48, marginBottom: 32, lineHeight: 1 }}>Payment<br/>Received</div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Ticket ID</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700 }}>{ticketId}</div>
                </div>
                <button onClick={() => navigator.clipboard.writeText(ticketId)} className="btn-ghost btn-xs">Copy</button>
              </div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '16px 20px', marginBottom: 32, textAlign: 'left' }}>
                {[['Order ID', orderId], ['Email', email], ['Payment', 'CashApp'], ['Total', `$${formatPrice(total)}`]].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{value}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase' }}>Make a ticket on Discord after paying</p>
              <button onClick={() => window.open('https://discord.gg/7QxUqzar', '_blank')} style={{ width: '100%', padding: '14px 0', background: '#5865F2', border: 'none', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff', marginBottom: 8, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>Open Discord</button>
              <button onClick={() => setPage('home')} style={{ width: '100%', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Return Home</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ━━━━ CUSTOMER AUTH ━━━━
function CustomerAuth({ customers, setCustomers, setCustomerUser, setPage }: any) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    const c = customers.find((c: Customer) => c.email === email && c.password === password);
    if (c) { setCustomerUser(c); setPage('dashboard'); } else setError('Invalid credentials');
  };
  const handleRegister = () => {
    if (password !== confirmPass) { setError('Passwords do not match'); return; }
    if (customers.find((c: Customer) => c.email === email)) { setError('Email already exists'); return; }
    const newCustomer: Customer = { id: genId('CUS'), name, email, password, balance: 0, totalOrders: 0, totalSpent: 0, memberSince: new Date().toISOString(), orders: [] };
    setCustomers((prev: Customer[]) => [...prev, newCustomer]);
    setCustomerUser(newCustomer); setPage('dashboard');
  };

  const Field = ({ label, value, onChange, type = 'text', placeholder }: any) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{label}</div>
      <input value={value} onChange={(e: any) => onChange(e.target.value)} type={type} placeholder={placeholder} className="input-field" />
    </div>
  );

  return (
    <section style={{ paddingTop: 80, paddingBottom: 80, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(239,30,30,0.05), transparent 70%)', pointerEvents: 'none' }} />
      <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 420, padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <CrosshairLogo size={40} />
          <div className="font-display" style={{ fontSize: 32, marginTop: 20, marginBottom: 8 }}>
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {tab === 'login' ? 'Sign in to your AllCheats.co account' : 'Join AllCheats.co today'}
          </p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', position: 'relative' }}>
          <div className="corner-accent corner-tl" /><div className="corner-accent corner-tr" />
          <div className="corner-accent corner-bl" /><div className="corner-accent corner-br" />

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                flex: 1, padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: tab === t ? 'var(--red)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--red)' : '2px solid transparent',
                transition: 'all 0.15s', marginBottom: -1
              }}>{t === 'login' ? 'Sign In' : 'Register'}</button>
            ))}
          </div>

          <div style={{ padding: '32px' }}>
            {tab === 'login' ? (
              <>
                <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Password</div>
                  <div style={{ position: 'relative' }}>
                    <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-field" style={{ paddingRight: 52 }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{showPass ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                {error && <div style={{ background: 'rgba(239,30,30,0.08)', border: '1px solid rgba(239,30,30,0.2)', padding: '10px 14px', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)' }}>{error}</div>}
                <button onClick={handleLogin} className="btn-red" style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 13 }}>Sign In</button>
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  No account?{' '}
                  <button onClick={() => { setTab('register'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 12 }}>Create one</button>
                </p>
              </>
            ) : (
              <>
                <Field label="Full Name" value={name} onChange={setName} placeholder="John Doe" />
                <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Password</div>
                  <div style={{ position: 'relative' }}>
                    <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="input-field" style={{ paddingRight: 52 }} />
                    <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{showPass ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <Field label="Confirm Password" value={confirmPass} onChange={setConfirmPass} type="password" placeholder="••••••••" />
                {error && <div style={{ background: 'rgba(239,30,30,0.08)', border: '1px solid rgba(239,30,30,0.2)', padding: '10px 14px', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)' }}>{error}</div>}
                <button onClick={handleRegister} className="btn-red" style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 13 }}>Create Account</button>
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <button onClick={() => { setTab('login'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 12 }}>Sign in</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ━━━━ CUSTOMER DASHBOARD ━━━━
function CustomerDashboard({ customer, setCustomerUser, setPage }: any) {
  if (!customer) { setPage('login'); return null; }
  const statusClass: Record<string, string> = { pending: 'badge-yellow', paid: 'badge-green', cancelled: 'badge-red' };

  return (
    <section style={{ paddingTop: 100, paddingBottom: 100, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 56, paddingBottom: 32, borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 52, height: 52, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 22, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 28, lineHeight: 1 }}>Welcome back, {customer.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{customer.email}</div>
            </div>
          </div>
          <button onClick={() => { setCustomerUser(null); setPage('home'); }} className="btn-ghost btn-sm">Sign Out</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, marginBottom: 56 }}>
          {[
            { label: 'Total Orders', value: customer.totalOrders },
            { label: 'Total Spent', value: `$${formatPrice(customer.totalSpent)}` },
            { label: 'Balance', value: `$${formatPrice(customer.balance)}` },
            { label: 'Member Since', value: new Date(customer.memberSince).toLocaleDateString() },
          ].map(s => (
            <div key={s.label} className="fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '28px 24px' }}>
              <div className="font-display" style={{ fontSize: 28, color: 'var(--red)', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="fade-up">
          <div className="section-label" style={{ marginBottom: 20 }}>Order History</div>
          {(customer.orders || []).length === 0 ? (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '64px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>No orders yet</p>
              <button onClick={() => setPage('products')} className="btn-red btn-sm">Browse Products</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(customer.orders || []).map((o: Order) => (
                <div key={o.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)' }}>{o.id}</span>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(o.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span className={`badge ${statusClass[o.status]}`}>{o.status.toUpperCase()}</span>
                    <div className="font-display" style={{ fontSize: 20, color: 'var(--red)' }}>${formatPrice(o.total)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ━━━━ ADMIN PANEL ━━━━
function AdminPanel({ adminUser, setAdminUser, adminAccounts, setAdminAccounts, orders, setOrders, announcements, setAnnouncements, promoCodes, setPromoCodes, products, setProducts, customers, setCustomers, onClose }: any) {
  const [tab, setTab] = useState('overview');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    const acc = adminAccounts.find((a: AdminAccount) => a.username === loginUser && a.password === loginPass && a.active);
    if (acc) {
      const updated = { ...acc, loginCount: acc.loginCount + 1, lastLogin: new Date().toISOString(), lastIp: '127.0.0.1', ipLogs: [...acc.ipLogs, { ip: '127.0.0.1', date: new Date().toISOString() }] };
      setAdminAccounts((prev: AdminAccount[]) => prev.map((a: AdminAccount) => a.id === acc.id ? updated : a));
      setAdminUser(updated); setLoginError('');
    } else setLoginError('Invalid credentials');
  };

  if (!adminUser) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(7,7,8,0.92)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
        <div className="grid-pattern" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', width: '100%', maxWidth: 380, position: 'relative' }} onClick={e => e.stopPropagation()} className="animate-modalIn">
          <div style={{ height: 2, background: 'var(--red)', marginBottom: 0 }} />
          <div style={{ padding: '40px' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>✕</button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{ width: 48, height: 48, background: 'rgba(239,30,30,0.08)', border: '1px solid rgba(239,30,30,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" fill="none" stroke="#ef1e1e" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
            </div>
            <div className="font-display" style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>Admin Access</div>
            <p style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 32 }}>Authorized Personnel Only</p>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Username</div>
              <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Enter username" className="input-field" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Password</div>
              <input value={loginPass} onChange={e => setLoginPass(e.target.value)} type="password" placeholder="••••••••" className="input-field" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            {loginError && <div style={{ background: 'rgba(239,30,30,0.08)', border: '1px solid rgba(239,30,30,0.2)', padding: '10px 14px', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>⚠ {loginError}</div>}
            <button onClick={handleLogin} className="btn-red" style={{ width: '100%', justifyContent: 'center', padding: '14px 0' }}>Authenticate</button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = adminUser.role === 'owner';
  const tabs = [
    { id: 'overview', label: 'Overview' }, { id: 'orders', label: 'Orders' },
    { id: 'announcements', label: 'Announce' }, { id: 'promos', label: 'Promos' },
    ...(isOwner ? [{ id: 'accounts', label: 'Accounts' }, { id: 'iplogs', label: 'IP Logs' }, { id: 'products', label: 'Products' }, { id: 'customers', label: 'Customers' }] : []),
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 200, background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '24px 0', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 16 }}>{adminUser.username[0].toUpperCase()}</div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14 }}>{adminUser.username}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{adminUser.role}</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              width: '100%', display: 'block', textAlign: 'left', padding: '10px 12px', background: tab === t.id ? 'rgba(239,30,30,0.08)' : 'none',
              border: tab === t.id ? '1px solid rgba(239,30,30,0.2)' : '1px solid transparent',
              cursor: 'pointer', marginBottom: 2,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: tab === t.id ? 'var(--red)' : 'var(--text-muted)', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (tab !== t.id) (e.currentTarget.style.color = 'var(--text)'); }}
            onMouseLeave={e => { if (tab !== t.id) (e.currentTarget.style.color = 'var(--text-muted)'); }}>
              {t.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { setAdminUser(null); onClose(); }} style={{ margin: '12px', padding: '10px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sign Out</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: 'rgba(7,7,8,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '6px 14px', background: tab === t.id ? 'rgba(239,30,30,0.1)' : 'transparent',
                border: tab === t.id ? '1px solid rgba(239,30,30,0.25)' : '1px solid transparent',
                cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: tab === t.id ? 'var(--red)' : 'var(--text-muted)', whiteSpace: 'nowrap'
              }}>{t.label}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>✕</button>
        </div>

        <div style={{ padding: '40px 40px', maxWidth: 960 }}>
          {tab === 'overview' && <AdminOverview orders={orders} promoCodes={promoCodes} adminAccounts={adminAccounts} announcements={announcements} isOwner={isOwner} />}
          {tab === 'orders' && <AdminOrders orders={orders} setOrders={setOrders} />}
          {tab === 'announcements' && <AdminAnnouncements announcements={announcements} setAnnouncements={setAnnouncements} />}
          {tab === 'promos' && <AdminPromos promoCodes={promoCodes} setPromoCodes={setPromoCodes} />}
          {tab === 'accounts' && isOwner && <AdminAccounts adminAccounts={adminAccounts} setAdminAccounts={setAdminAccounts} currentUser={adminUser} />}
          {tab === 'iplogs' && isOwner && <AdminIPLogs adminAccounts={adminAccounts} />}
          {tab === 'products' && isOwner && <AdminProducts products={products} setProducts={setProducts} />}
          {tab === 'customers' && isOwner && <AdminCustomers customers={customers} setCustomers={setCustomers} />}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Sub-Components ───
function AdminOverview({ orders, promoCodes, adminAccounts, announcements, isOwner }: any) {
  const totalRevenue = orders.filter((o: Order) => o.status === 'paid').reduce((s: number, o: Order) => s + o.total, 0);
  const statusClass: Record<string, string> = { pending: 'badge-yellow', paid: 'badge-green', cancelled: 'badge-red' };

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>Overview</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2, marginBottom: 48 }}>
        {[
          { label: 'Total Revenue', value: `$${formatPrice(totalRevenue)}`, color: 'var(--green)' },
          { label: 'Total Orders', value: orders.length },
          { label: 'Active Promos', value: promoCodes.filter((p: PromoCode) => p.active).length },
          ...(isOwner ? [{ label: 'Admins', value: adminAccounts.length }] : []),
        ].map((s: any) => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '24px 20px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{s.label}</div>
            <div className="font-display" style={{ fontSize: 32, color: s.color || 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Recent Orders</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 40 }}>
        {orders.slice(0, 5).map((o: Order) => (
          <div key={o.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{o.id}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', marginLeft: 10 }}>{o.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="font-display" style={{ fontSize: 16, color: 'var(--red)' }}>${formatPrice(o.total)}</span>
              <span className={`badge ${statusClass[o.status]}`}>{o.status}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', padding: '24px 0', textAlign: 'center' }}>No orders yet</p>}
      </div>
    </div>
  );
}

function AdminOrders({ orders, setOrders }: any) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const statusClass: Record<string, string> = { pending: 'badge-yellow', paid: 'badge-green', cancelled: 'badge-red' };
  let filtered = orders;
  if (filter !== 'all') filtered = filtered.filter((o: Order) => o.status === filter);
  if (search) filtered = filtered.filter((o: Order) => o.email.includes(search) || o.id.includes(search) || o.ticketId.includes(search));

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>Orders</div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email, order ID..." className="input-field" style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 2, marginBottom: 24 }}>
        {['all', 'pending', 'paid', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', background: filter === f ? 'rgba(239,30,30,0.1)' : 'var(--bg2)',
            border: `1px solid ${filter === f ? 'rgba(239,30,30,0.3)' : 'var(--border)'}`,
            cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: filter === f ? 'var(--red)' : 'var(--text-muted)'
          }}>{f}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.map((o: Order) => (
          <div key={o.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{o.id}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', marginLeft: 10 }}>{o.ticketId}</span>
              </div>
              <span className={`badge ${statusClass[o.status]}`}>{o.status.toUpperCase()}</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)', marginBottom: 14 }}>{o.email} · ${formatPrice(o.total)} · {new Date(o.date).toLocaleDateString()}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['paid', 'badge-green', 'Mark Paid'], ['pending', 'badge-yellow', 'Mark Pending'], ['cancelled', 'badge-red', 'Cancel']].map(([status, cls, label]) => (
                <button key={status} onClick={() => setOrders((prev: Order[]) => prev.map((or: Order) => or.id === o.id ? { ...or, status: status as any } : or))}
                  className={`badge ${cls}`} style={{ cursor: 'pointer', border: 'none', background: undefined }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', padding: '40px 0', textAlign: 'center' }}>No orders found</p>}
      </div>
    </div>
  );
}

function AdminAnnouncements({ announcements, setAnnouncements }: any) {
  const [text, setText] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'promo'>('info');
  const typeClass: Record<string, string> = { info: 'badge-blue', success: 'badge-green', warning: 'badge-yellow', promo: 'badge-purple' };
  const add = () => {
    if (!text) return;
    setAnnouncements((prev: Announcement[]) => [...prev, { id: genId('ANN'), text, type, active: true, date: new Date().toISOString() }]);
    setText('');
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>Announcements</div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '24px', marginBottom: 24 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Announcement text..." className="input-field" style={{ marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['info', 'success', 'warning', 'promo'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} className={`badge ${type === t ? typeClass[t] : ''}`} style={{ cursor: 'pointer', opacity: type === t ? 1 : 0.5, border: type === t ? undefined : '1px solid var(--border)' }}>{t}</button>
          ))}
        </div>
        <button onClick={add} className="btn-red btn-sm">Publish</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {announcements.map((a: Announcement) => (
          <div key={a.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <span className={`badge ${typeClass[a.type]}`} style={{ flexShrink: 0 }}>{a.type}</span>
              <span style={{ fontSize: 13, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button onClick={() => setAnnouncements((prev: Announcement[]) => prev.map((an: Announcement) => an.id === a.id ? { ...an, active: !an.active } : an))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: a.active ? 'var(--green)' : 'var(--text-muted)' }}>{a.active ? 'Active' : 'Off'}</button>
              <button onClick={() => setAnnouncements((prev: Announcement[]) => prev.filter((an: Announcement) => an.id !== a.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPromos({ promoCodes, setPromoCodes }: any) {
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const addPromo = () => {
    if (!code || !value) return;
    setPromoCodes((prev: PromoCode[]) => [...prev, { code: code.toUpperCase(), type, value: parseFloat(value), active: true, uses: 0 }]);
    setCode(''); setValue('');
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>Promo Codes</div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CODE" className="input-field" style={{ flex: 1, minWidth: 120, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 }} />
          <div style={{ display: 'flex', gap: 2 }}>
            {(['percentage', 'fixed'] as const).map(t => (
              <button key={t} onClick={() => setType(t)} className={`btn-sm ${type === t ? 'btn-red' : 'btn-ghost'}`} style={{ padding: '10px 16px' }}>{t === 'percentage' ? '%' : '$'}</button>
            ))}
          </div>
          <input value={value} onChange={e => setValue(e.target.value)} type="number" placeholder="Value" className="input-field" style={{ width: 100 }} />
          <button onClick={addPromo} className="btn-red btn-sm">Create</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {promoCodes.map((p: PromoCode, i: number) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 }}>{p.code}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>{p.type === 'percentage' ? `${p.value}%` : `$${p.value}`} off</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.uses} uses</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setPromoCodes((prev: PromoCode[]) => prev.map((pc: PromoCode, j: number) => j === i ? { ...pc, active: !pc.active } : pc))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.active ? 'var(--green)' : 'var(--text-muted)' }}>{p.active ? 'Active' : 'Off'}</button>
              <button onClick={() => setPromoCodes((prev: PromoCode[]) => prev.filter((_: PromoCode, j: number) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--red)' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAccounts({ adminAccounts, setAdminAccounts, currentUser }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'manager' | 'staff'>('staff');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ username: '', password: '', role: 'staff' as 'owner' | 'manager' | 'staff' });
  const roleClass: Record<string, string> = { owner: 'badge-purple', manager: 'badge-blue', staff: 'badge-green' };

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>Admin Accounts</div>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="input-field" style={{ flex: 1, minWidth: 120 }} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="input-field" style={{ flex: 1, minWidth: 120 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['owner', 'manager', 'staff'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)} className={`badge ${role === r ? roleClass[r] : ''}`} style={{ cursor: 'pointer', opacity: role === r ? 1 : 0.5, border: role === r ? undefined : '1px solid var(--border)' }}>{r}</button>
          ))}
        </div>
        <button onClick={() => { if (!username || !password) return; setAdminAccounts((prev: AdminAccount[]) => [...prev, { id: genId('ADM'), username, password, role, active: true, loginCount: 0, lastIp: '', lastLogin: '', ipLogs: [] }]); setUsername(''); setPassword(''); }} className="btn-red btn-sm">Create Account</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {adminAccounts.map((a: AdminAccount) => (
          <div key={a.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            {editingId === a.id ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <input value={editData.username} onChange={e => setEditData({ ...editData, username: e.target.value })} className="input-field" style={{ flex: 1, minWidth: 120 }} />
                <input value={editData.password} onChange={e => setEditData({ ...editData, password: e.target.value })} type="password" placeholder="New password" className="input-field" style={{ flex: 1, minWidth: 120 }} />
                <button onClick={() => { setAdminAccounts((prev: AdminAccount[]) => prev.map((ac: AdminAccount) => ac.id === a.id ? { ...ac, username: editData.username, password: editData.password || ac.password, role: editData.role } : ac)); setEditingId(null); }} className="btn-red btn-xs">Save</button>
                <button onClick={() => setEditingId(null)} className="btn-ghost btn-xs">Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 34, height: 34, background: 'rgba(239,30,30,0.1)', border: '1px solid rgba(239,30,30,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 16, color: 'var(--red)' }}>{a.username[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.username}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={`badge ${roleClass[a.role]}`}>{a.role}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: a.active ? 'var(--green)' : 'var(--red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{a.active ? '● Active' : '● Off'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)' }}>{a.loginCount} logins</span>
                  <button onClick={() => { setEditingId(a.id); setEditData({ username: a.username, password: '', role: a.role }); }} className="btn-ghost btn-xs">Edit</button>
                  {a.id !== currentUser.id && (
                    <>
                      <button onClick={() => setAdminAccounts((prev: AdminAccount[]) => prev.map((ac: AdminAccount) => ac.id === a.id ? { ...ac, active: !ac.active } : ac))} className="btn-ghost btn-xs">{a.active ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => setAdminAccounts((prev: AdminAccount[]) => prev.filter((ac: AdminAccount) => ac.id !== a.id))} className="btn-xs" style={{ padding: '6px 14px', clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))', background: 'rgba(239,30,30,0.1)', border: '1px solid rgba(239,30,30,0.2)', color: 'var(--red)', cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminIPLogs({ adminAccounts }: any) {
  const allLogs = adminAccounts.flatMap((a: AdminAccount) => a.ipLogs.map((l: { ip: string; date: string }) => ({ ...l, username: a.username, role: a.role })))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 200);
  const relativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now'; if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>IP Logs</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2, marginBottom: 32 }}>
        {adminAccounts.map((a: AdminAccount) => (
          <div key={a.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.username}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{a.loginCount} logins</div>
            {a.lastIp && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--red)' }}>{a.lastIp}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {allLogs.map((l: any, i: number) => (
          <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{l.username}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{l.role}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="badge badge-red">{l.ip}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)' }}>{relativeTime(l.date)}</span>
            </div>
          </div>
        ))}
        {allLogs.length === 0 && <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', padding: '40px 0', textAlign: 'center', textTransform: 'uppercase' }}>No login history</p>}
      </div>
    </div>
  );
}

function AdminProducts({ products, setProducts }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>Products</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {products.map((p: Product) => (
          <div key={p.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            {editingId === p.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="Name" className="input-field" />
                <input value={editData.price || ''} onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })} type="number" placeholder="Price" className="input-field" />
                <textarea value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Description" className="input-field" style={{ height: 80, resize: 'vertical', fontFamily: 'Barlow, sans-serif' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setProducts((prev: Product[]) => prev.map((pr: Product) => pr.id === p.id ? { ...pr, ...editData } : pr)); setEditingId(null); }} className="btn-red btn-xs">Save</button>
                  <button onClick={() => setEditingId(null)} className="btn-ghost btn-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="font-display" style={{ fontSize: 18, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                    ${formatPrice(p.price)} · {categories.find(c => c.id === p.category)?.name}{p.variants ? ` · ${p.variants.length} variants` : ''}
                  </div>
                </div>
                <button onClick={() => { setEditingId(p.id); setEditData({ name: p.name, price: p.price, description: p.description }); }} className="btn-ghost btn-xs">Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCustomers({ customers, setCustomers }: any) {
  const [search, setSearch] = useState('');
  const [balanceInput, setBalanceInput] = useState<Record<string, string>>({});
  const filtered = search ? customers.filter((c: Customer) => c.name.includes(search) || c.email.includes(search)) : customers;

  return (
    <div>
      <div className="font-display" style={{ fontSize: 36, marginBottom: 32 }}>Customers</div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input-field" style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filtered.map((c: Customer) => (
          <div key={c.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-muted)' }}>{c.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-display" style={{ fontSize: 20, color: 'var(--green)' }}>${formatPrice(c.balance)}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.totalOrders} orders</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={balanceInput[c.id] || ''} onChange={e => setBalanceInput({ ...balanceInput, [c.id]: e.target.value })} type="number" placeholder="Amount" className="input-field" style={{ flex: 1, fontSize: 12, padding: '8px 12px' }} />
              <button onClick={() => { const amt = parseFloat(balanceInput[c.id] || '0'); setCustomers((prev: Customer[]) => prev.map((cu: Customer) => cu.id === c.id ? { ...cu, balance: cu.balance + amt } : cu)); setBalanceInput({ ...balanceInput, [c.id]: '' }); }} className="badge badge-green" style={{ cursor: 'pointer' }}>Add</button>
              <button onClick={() => { const amt = parseFloat(balanceInput[c.id] || '0'); setCustomers((prev: Customer[]) => prev.map((cu: Customer) => cu.id === c.id ? { ...cu, balance: Math.max(0, cu.balance - amt) } : cu)); setBalanceInput({ ...balanceInput, [c.id]: '' }); }} className="badge badge-red" style={{ cursor: 'pointer' }}>Deduct</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', padding: '40px 0', textAlign: 'center', textTransform: 'uppercase' }}>No customers found</p>}
      </div>
    </div>
  );
}

// ━━━━ FOOTER ━━━━
function Footer({ setPage }: { setPage: (p: string) => void }) {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '64px 32px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 32, marginBottom: 48, paddingBottom: 40, borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <CrosshairLogo size={24} />
              <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                All<span style={{ color: 'var(--red)' }}>Cheats</span>.co
              </span>
            </div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Next-Gen AI Gaming Tools</p>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[['Products', () => setPage('products')], ['Discord', () => window.open('https://discord.gg/7QxUqzar', '_blank')], ['Support', () => window.open('https://discord.gg/7QxUqzar', '_blank')]].map(([label, action]) => (
              <button key={label as string} onClick={action as any} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                {label as string}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Owned by Red.Gov & Ryoko · Made by Death
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            © 2026 AllCheats.co · For Educational Purposes
          </div>
        </div>
      </div>
    </footer>
  );
}
