import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headphones, ArrowRight, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      toast.success('Thank you for subscribing to MarketPulse product drops!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800 mt-auto">
      {/* Guarantees Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Complimentary for orders above $150</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Verified Vendors</h4>
              <p className="text-xs text-slate-400 mt-0.5">Authenticity guaranteed across all items</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-sky-400 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">30-Day Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free direct return guarantee</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Concierge Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">24/7 dedicated merchant assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                M
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Market<span className="text-indigo-400">Pulse</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier curated multi-vendor marketplace connecting independent craft manufacturers, acoustic engineers, and technical apparel studios directly with consumers worldwide.
            </p>
            <div className="pt-2">
              <form onSubmit={handleSubscribe} className="flex max-w-md gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for private drops..."
                  className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  {subscribed ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  <span>Join</span>
                </button>
              </form>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Marketplace</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/products?category=electronics" className="hover:text-white transition-colors">
                  Computing & Peripherals
                </Link>
              </li>
              <li>
                <Link to="/products?category=audio" className="hover:text-white transition-colors">
                  Acoustic Systems
                </Link>
              </li>
              <li>
                <Link to="/products?category=wearables" className="hover:text-white transition-colors">
                  Hybrid Wearables
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion" className="hover:text-white transition-colors">
                  Technical Apparel
                </Link>
              </li>
              <li>
                <Link to="/products?category=workspace" className="hover:text-white transition-colors">
                  Ergonomic Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Merchant Ecosystem */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Vendors</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/vendor" className="hover:text-white transition-colors">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Apply for Storefront
                </Link>
              </li>
              <li>
                <Link to="/vendor/products/new" className="hover:text-white transition-colors">
                  List Products
                </Link>
              </li>
              <li>
                <Link to="/vendor/orders" className="hover:text-white transition-colors">
                  Fulfillment Guidelines
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors text-slate-500">
                  Platform Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Support</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Cart & Bag
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Shipping Rates</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2025 MarketPulse Platform Inc. Built with React & PostgreSQL architecture.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> REST API Operational
          </span>
          <span>SDE Portfolio Edition</span>
        </div>
      </div>
    </footer>
  );
};
