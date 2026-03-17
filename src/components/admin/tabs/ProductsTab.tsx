import { useState } from 'react';
import { Edit2, Check, X, Package } from 'lucide-react';
import { Product } from '../../../data/storeData';

interface Props {
  products: Product[];
  setProducts: (p: Product[]) => void;
}

export default function ProductsTab({ products, setProducts }: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});

  const save = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem('ac_products', JSON.stringify(updated));
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setEditData({ name: p.name, startingPrice: p.startingPrice, description: p.description, longDescription: p.longDescription });
  };

  const saveEdit = (id: string) => {
    save(products.map((p) => (p.id === id ? { ...p, ...editData } : p)));
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Products</h2>
        <p className="text-sm text-gray-500">Edit your product listings live without touching code.</p>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border border-dark-500 bg-dark-800 p-5">
            {editId === p.id ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Product Name</label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm text-white outline-none focus:border-red-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Starting Price</label>
                    <input
                      type="text"
                      value={editData.startingPrice || ''}
                      onChange={(e) => setEditData({ ...editData, startingPrice: e.target.value })}
                      className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm text-white outline-none focus:border-red-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Short Description</label>
                  <input
                    type="text"
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm text-white outline-none focus:border-red-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Full Description</label>
                  <textarea
                    value={editData.longDescription || ''}
                    onChange={(e) => setEditData({ ...editData, longDescription: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-dark-500 bg-dark-700 px-3 py-2 text-sm text-white outline-none resize-none focus:border-red-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(p.id)} className="flex items-center gap-1 rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-2 text-sm font-semibold text-green-400 hover:bg-green-500/30 transition">
                    <Check className="h-4 w-4" /> Save Changes
                  </button>
                  <button onClick={() => setEditId(null)} className="flex items-center gap-1 rounded-lg border border-dark-500 bg-dark-700 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition">
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dark-700 text-2xl">{p.image}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{p.name}</h3>
                      {p.tag && <span className="rounded-full bg-red-primary/20 border border-red-primary/30 px-2 py-0.5 text-xs font-semibold text-red-light">{p.tag}</span>}
                    </div>
                    <p className="mt-0.5 text-sm text-gray-400">{p.description}</p>
                    <div className="mt-1 flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {p.totalStock} in stock</span>
                      <span className="text-red-light font-semibold">From {p.startingPrice}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.variants.map((v, i) => (
                        <span key={i} className="rounded-full border border-dark-500 bg-dark-700 px-2 py-0.5 text-xs text-gray-400">{v.name} — {v.price}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => startEdit(p)} className="flex items-center gap-1 rounded-lg border border-dark-500 bg-dark-700 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white transition shrink-0">
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
