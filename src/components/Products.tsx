import ProductCard from './ProductCard';
import { defaultProducts } from '../data/storeData';
import { ShieldCheck, Star, Zap } from 'lucide-react';

export default function Products() {
  return (
    <section id="products" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full border border-red-primary/30 bg-red-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-red-light">
            Our Products
          </span>
          <h2 className="glow-text text-3xl font-extrabold text-white sm:text-4xl">
            Browse <span className="text-red-light">Products</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400">
            Choose from our premium selection of AI-powered cheats and game accounts. All products are verified, working, and ready for instant delivery.
          </p>

          {/* 99% Success Rate Badge */}
          <div className="mt-6 inline-flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/10 px-5 py-2 text-sm font-bold text-green-400 shadow-lg shadow-green-900/20">
              <ShieldCheck className="h-4 w-4" />
              99% Success Rate — Verified Working
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> Top Rated</span>
              <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-red-light" /> Instant Delivery</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-green-500" /> 100% Safe</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {defaultProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
