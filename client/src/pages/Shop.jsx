import React, { useEffect, useState, useCallback } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { Loader } from '../components/Loader.jsx';
import * as api from '../services/api';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', maxPrice: '', search: '', sort: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.search) params.search = filters.search;
      if (filters.sort) params.sort = filters.sort;
      const res = await api.fetchProducts(params);
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    api.fetchCategories().then((res) => setCategories(res.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Shop</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse our full catalog across every category.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder="Search products..."
          className="w-full max-w-xs rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-accent dark:border-white/10 dark:bg-panel dark:text-white dark:placeholder-slate-500"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-accent dark:border-white/10 dark:bg-panel dark:text-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          placeholder="Max price (₹)"
          className="w-40 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-accent dark:border-white/10 dark:bg-panel dark:text-white dark:placeholder-slate-500"
        />
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-slate-900 outline-none focus:border-accent dark:border-white/10 dark:bg-panel dark:text-white"
        >
          <option value="">Sort: Top rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <Loader label="Loading products..." />
      ) : products.length === 0 ? (
        <p className="mt-16 text-center text-sm text-slate-500 dark:text-slate-400">No products match your filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
