import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Landing from './pages/Landing.jsx';
import Shop from './pages/Shop.jsx';
import AIShopping from './pages/AIShopping.jsx';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/ai-shopping" element={<AIShopping />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="*"
          element={
            <div className="mx-auto max-w-2xl px-6 py-24 text-center">
              <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">404</h1>
              <p className="mt-2 text-slate-400">Page not found.</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
