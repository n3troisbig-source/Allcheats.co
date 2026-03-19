import { useState } from 'react';
import { Check, ShoppingCart, Lock, ChevronDown, ChevronUp, Package, X, Copy, CheckCheck } from 'lucide-react';
import { Product } from '../data/storeData';
import { placeOrder, Order } from '../data/orderStore';

type Step = 'select' | 'info' | 'confirm' | 'done';

export default function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');

  // Customer info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  // Placed order
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const variant = product.variants[selectedVariant];

  const openModal = () => {
    setStep('select');
    setName('');
    setEmail('');
    setErrors({});
    setPlacedOrder(null);
    setCopied(false);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setTimeout(() => {
      setStep('select');
      setName('');
      setEmail('');
      setErrors({});
      setPlacedOrder(null);
    }, 300);
  };

  const validate = () => {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitInfo = () => {
    if (validate()) setStep('confirm');
  };

  const handlePlaceOrder = () => {
    const order = placeOrder({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      product: product.name,
      variant: variant.name,
      total: parseFloat(variant.price.replace('$', '')),
    });
    setPlacedOrder(order);
    setStep('done');
  };

  const copyTicket = () => {
    if (placedOrder) {
      navigator.clipboard.writeText(placedOrder.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Price as number
  const priceNum = parseFloat(variant.price.replace('$', ''));

  return (
    <>
      <div className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-dark-500 bg-dark-800">
        {/* Header image area */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-dark-700 via-dark-800 to-red-primary/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">{product.image}</div>
          </div>
          {product.tag && (
            <div className="absolute left-3 top-3 rounded-full bg-red-primary px-3 py-1 text-xs font-bold text-white">
              {product.tag}
            </div>
          )}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
            </span>
            {product.status}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-800 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{product.description}</p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="mb-4 flex items-center gap-1 text-xs text-red-light transition hover:text-red-hover"
          >
            {expanded ? 'Hide' : 'Show'} Details
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expanded && (
            <div className="animate-slide-down mb-4 rounded-lg border border-dark-500 bg-dark-700 p-3 text-xs leading-relaxed text-gray-400">
              {product.longDescription}
            </div>
          )}

          <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
            <Package className="h-3.5 w-3.5" />
            <span>{product.totalStock} Available</span>
          </div>

          {product.notice && (
            <div className="mb-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400 leading-relaxed">
              {product.notice}
            </div>
          )}

          {/* Variants */}
          <div className="mb-4 space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {product.variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariant(i)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition ${
                  selectedVariant === i
                    ? 'border-red-primary bg-red-primary/10 text-white'
                    : 'border-dark-500 bg-dark-700 text-gray-300 hover:border-dark-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-red-light" />
                  <div>
                    <div className="text-sm font-medium">{v.name}</div>
                    <div className="text-[11px] text-gray-500">{v.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-light">{v.price}</span>
                  {selectedVariant === i && <Check className="h-4 w-4 text-red-light" />}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Starting at</span>
              <div className="text-xl font-bold text-white">{product.startingPrice}</div>
            </div>
            <button
              onClick={openModal}
              className="flex items-center gap-2 rounded-xl bg-red-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-hover"
            >
              <ShoppingCart className="h-4 w-4" />
              Purchase
            </button>
          </div>
        </div>
      </div>

      {/* ── Purchase Modal ───────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="animate-fade-in-up w-full max-w-md rounded-2xl border border-dark-500 bg-dark-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-dark-600 px-5 py-4">
              <div>
                <h3 className="font-bold text-white">
                  {step === 'select' && 'Choose Your Option'}
                  {step === 'info' && 'Your Details'}
                  {step === 'confirm' && 'Confirm Order'}
                  {step === 'done' && '✅ Order Placed!'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{product.name}</p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-1.5 text-gray-500 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              {/* ── STEP 1: select variant ── */}
              {step === 'select' && (
                <div className="space-y-4">
                  {product.notice && (
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400 leading-relaxed">
                      {product.notice}
                    </div>
                  )}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition ${
                          selectedVariant === i
                            ? 'border-red-primary bg-red-primary/10'
                            : 'border-dark-500 bg-dark-700 hover:border-dark-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Lock className="h-4 w-4 text-red-light flex-shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-white">{v.name}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">{v.description}</div>
                            <div className="text-[11px] text-gray-600 mt-0.5">{v.stock} in stock</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-base font-bold text-red-light">{v.price}</span>
                          {selectedVariant === i && <Check className="h-4 w-4 text-red-light" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep('info')}
                    className="w-full rounded-xl bg-red-primary py-3 text-sm font-bold text-white transition hover:bg-red-hover"
                  >
                    Continue — {variant.price}
                  </button>
                </div>
              )}

              {/* ── STEP 2: customer info ── */}
              {step === 'info' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-dark-500 bg-dark-700 p-3 text-xs text-gray-400">
                    We need your info to track your order. Your ticket ID will be sent after you submit.
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-300">Your Name / Username</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. ShadowGamer"
                      className={`w-full rounded-xl border bg-dark-700 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition ${
                        errors.name ? 'border-red-500' : 'border-dark-500 focus:border-red-primary'
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-300">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. you@gmail.com"
                      className={`w-full rounded-xl border bg-dark-700 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition ${
                        errors.email ? 'border-red-500' : 'border-dark-500 focus:border-red-primary'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('select')}
                      className="flex-1 rounded-xl border border-dark-500 bg-dark-700 py-3 text-sm font-semibold text-gray-400 transition hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitInfo}
                      className="flex-1 rounded-xl bg-red-primary py-3 text-sm font-bold text-white transition hover:bg-red-hover"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: confirm ── */}
              {step === 'confirm' && (
                <div className="space-y-4">
                  {/* Order summary */}
                  <div className="rounded-xl border border-dark-500 bg-dark-700 p-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Product</span>
                      <span className="text-white font-medium">{product.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Variant</span>
                      <span className="text-white font-medium">{variant.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Name</span>
                      <span className="text-white font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white font-medium">{email}</span>
                    </div>
                    <div className="border-t border-dark-500 pt-2.5 flex justify-between">
                      <span className="text-sm font-semibold text-gray-300">Total</span>
                      <span className="text-lg font-bold text-red-light">{variant.price}</span>
                    </div>
                  </div>

                  {/* Payment instructions */}
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-green-400 mb-1">💸 Payment via CashApp</p>
                    <p className="text-sm text-gray-300">
                      Send <span className="font-bold text-white">${priceNum.toFixed(2)}</span> to{' '}
                      <span className="font-mono font-bold text-green-400">{product.id === 'p2' ? '$souz1902' : '$allcheats'}</span>
                    </p>
                    {product.id === 'p2' && (
                      <p className="text-[11px] text-gray-500">Acc Gen payments go to <span className="font-mono text-green-400">$souz1902</span></p>
                    )}
                  </div>

                  {/* Ticket instruction */}
                  <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-yellow-400">🎟️ After Paying — Make a Ticket!</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      After you send the money, <span className="text-white font-semibold">join our Discord and make a ticket</span> with:
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold mt-0.5">→</span>
                        <span><span className="text-white font-semibold">Screenshot / proof</span> of sending the money on CashApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold mt-0.5">→</span>
                        <span><span className="text-white font-semibold">What you bought</span> — product name &amp; variant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 font-bold mt-0.5">→</span>
                        <span>Your <span className="text-yellow-300 font-semibold">Ticket ID</span> (shown after placing order)</span>
                      </li>
                    </ul>
                    <a
                      href="https://discord.gg/skxTSTBS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition py-2 px-4 text-xs font-bold text-white w-full"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.998 19.998 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                      Join Discord &amp; Make a Ticket
                    </a>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('info')}
                      className="flex-1 rounded-xl border border-dark-500 bg-dark-700 py-3 text-sm font-semibold text-gray-400 transition hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 rounded-xl bg-red-primary py-3 text-sm font-bold text-white transition hover:bg-red-hover"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: done ── */}
              {step === 'done' && placedOrder && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-bold text-green-400 text-lg">Order Submitted!</p>
                    <p className="text-xs text-gray-400 mt-1">Your order is now <span className="text-yellow-400 font-semibold">Pending</span> — send payment to complete it.</p>
                  </div>

                  {/* Ticket ID */}
                  <div className="rounded-xl border border-dark-500 bg-dark-700 p-4">
                    <p className="text-xs text-gray-500 mb-1">Your Ticket ID (save this!)</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-sm font-bold text-white bg-dark-600 rounded-lg px-3 py-2 select-all">
                        {placedOrder.ticketId}
                      </code>
                      <button
                        onClick={copyTicket}
                        className="flex items-center gap-1.5 rounded-lg border border-dark-500 bg-dark-600 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
                      >
                        {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-600 font-mono">Order: {placedOrder.id}</p>
                  </div>

                  {/* Steps */}
                  <div className="rounded-xl border border-dark-500 bg-dark-700 p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-300 mb-1">✅ What To Do Now:</p>

                    <div className="flex items-start gap-2.5 text-xs text-gray-400">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-primary/20 text-red-light font-bold text-[10px]">1</span>
                      <span>Send <span className="text-white font-bold">${priceNum.toFixed(2)}</span> to CashApp tag <span className="font-mono text-green-400 font-bold">{product.id === 'p2' ? '$souz1902' : '$allcheats'}</span></span>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-gray-400">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-primary/20 text-red-light font-bold text-[10px]">2</span>
                      <span><span className="text-yellow-400 font-bold">Join our Discord &amp; make a ticket</span> with proof of payment</span>
                    </div>

                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-1.5 ml-7">
                      <p className="text-[11px] font-semibold text-yellow-400 mb-1">📋 Include in your ticket:</p>
                      <div className="flex items-start gap-1.5 text-[11px] text-gray-400">
                        <span className="text-yellow-400">→</span>
                        <span><span className="text-white font-semibold">Screenshot</span> of your CashApp payment / proof of sending money</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-gray-400">
                        <span className="text-yellow-400">→</span>
                        <span><span className="text-white font-semibold">What you bought:</span> <span className="text-red-light">{product.name} — {variant.name}</span></span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-gray-400">
                        <span className="text-yellow-400">→</span>
                        <span>Your Ticket ID: <span className="font-mono text-yellow-300 font-bold">{placedOrder.ticketId}</span></span>
                      </div>
                      <a
                        href="https://discord.gg/skxTSTBS"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition py-2 px-4 text-[11px] font-bold text-white w-full"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.998 19.998 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                        Click Here — Join Discord &amp; Make a Ticket
                      </a>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs text-gray-400">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-primary/20 text-red-light font-bold text-[10px]">3</span>
                      <span>We'll verify your payment and deliver your product ⚡</span>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full rounded-xl bg-dark-700 border border-dark-500 py-3 text-sm font-semibold text-gray-300 transition hover:text-white"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
