import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { SearchBar } from '../common/SearchBar';
import {
  ShoppingBag,
  User,
  Store,
  Shield,
  Menu,
  X,
  Layers,
  ChevronDown,
  LogOut,
  Package,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (term) => {
    if (term.trim()) {
      navigate(`/products?search=${encodeURIComponent(term.trim())}`);
    } else {
      navigate('/products');
    }
    setMobileMenuOpen(false);
  };

  const navCategories = [
    { name: 'All Products', href: '/products' },
    { name: 'Electronics', href: '/products?category=electronics' },
    { name: 'Audio', href: '/products?category=audio' },
    { name: 'Wearables', href: '/products?category=wearables' },
    { name: 'Fashion', href: '/products?category=fashion' },
    { name: 'Workspace', href: '/products?category=workspace' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 text-center font-medium border-b border-slate-800 flex items-center justify-between">
        <div className="hidden sm:block text-slate-400">
          Official Multi-Vendor Commerce Platform
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-4">
          <span>✨ Free express shipping on all orders over $150</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-400">
          {user?.role === 'VENDOR' ? (
            <Link to="/vendor" className="hover:text-white transition-colors flex items-center gap-1 text-indigo-400 font-semibold">
              <Store className="w-3 h-3" /> Vendor Dashboard
            </Link>
          ) : user?.role === 'ADMIN' ? (
            <Link to="/admin" className="hover:text-white transition-colors flex items-center gap-1 text-purple-400 font-semibold">
              <Shield className="w-3 h-3" /> Admin Dashboard
            </Link>
          ) : (
            <Link to="/vendor" className="hover:text-white transition-colors flex items-center gap-1">
              <Store className="w-3 h-3" /> Sell on MarketPulse
            </Link>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                Market<span className="text-indigo-600">Pulse</span>
              </span>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-slate-600 mt-0.5">
                Multi-Vendor
              </span>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <SearchBar onSearch={handleSearch} placeholder="Search curated products, gadgets, and verified vendors..." />
          </div>

          {/* Right Navigation Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth Links */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium text-slate-800 text-xs max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 text-sm"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider">
                          Role: {user.role}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Account Settings
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" /> My Orders
                    </Link>

                    {user.role === 'VENDOR' && (
                      <Link
                        to="/vendor"
                        className="flex items-center gap-2.5 px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-medium transition-colors"
                      >
                        <Store className="w-4 h-4" /> Vendor Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-purple-600 hover:bg-purple-50 font-medium transition-colors"
                      >
                        <Shield className="w-4 h-4" /> Admin Console
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-rose-600 hover:bg-rose-50 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 md:hidden hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:flex items-center gap-6 py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600 overflow-x-auto">
          <Link
            to="/products"
            className="flex items-center gap-1.5 font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" /> Catalog
          </Link>
          {navCategories.slice(1).map((cat) => {
            const isActive = location.search.includes(cat.href.split('?')[1]);
            return (
              <Link
                key={cat.name}
                to={cat.href}
                className={`transition-colors whitespace-nowrap hover:text-indigo-600 ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <SearchBar onSearch={handleSearch} placeholder="Search products..." />

          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase text-slate-400 px-3 tracking-wider">
              Browse Categories
            </p>
            {navCategories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <p className="text-[11px] font-bold uppercase text-slate-400 px-3 tracking-wider">
              Platform Portals
            </p>
            <Link
              to="/vendor"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-indigo-600 font-medium hover:bg-indigo-50"
            >
              <Store className="w-4 h-4" /> Vendor Dashboard
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-purple-600 font-medium hover:bg-purple-50"
            >
              <Shield className="w-4 h-4" /> Admin Console
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
