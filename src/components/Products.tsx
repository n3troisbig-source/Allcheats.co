import ProductCard from './ProductCard';
import { defaultProducts } from '../data/storeData';

export default function Products() {
  return (
    <section id="products" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full border border-red-primary/30 bg-red-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-red-light">
            Our Products
          </span>
          <h2 className="glow-text text-3xl font-extrabold text-white sm:text-4xl">
            Shop <span className="text-red-light">Now</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400">
            Choose from our premium selection of AI-powered cheats and game accounts. All products are verified, working, and ready for instant delivery.
          </p>
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
