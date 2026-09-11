import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, Sparkles, Store, Shield, User } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const user = await login(email, password);
      if (user) {
        if (user.role === 'VENDOR') navigate('/vendor');
        else if (user.role === 'ADMIN') navigate('/admin');
        else navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      // Toast already shown in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (targetRole) => {
    if (targetRole === 'CUSTOMER') {
      setEmail('customer@marketplace.com');
      setPassword('password123');
    } else if (targetRole === 'VENDOR') {
      setEmail('vendor@marketplace.com');
      setPassword('password123');
    } else if (targetRole === 'ADMIN') {
      setEmail('admin@marketplace.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-xl text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm">
              M
            </div>
            <span>Market<span className="text-indigo-600">Pulse</span></span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Sign in to access your orders, store management, or admin console
          </p>
        </div>

        {/* Demo Fast Fill Buttons */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fast Fill Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('CUSTOMER')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <User className="w-3 h-3 text-indigo-600" /> Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('VENDOR')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <Store className="w-3 h-3 text-indigo-600" /> Vendor
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ADMIN')}
              className="py-1.5 px-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors"
            >
              <Shield className="w-3 h-3 text-indigo-600" /> Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@example.com"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-indigo-600 hover:underline font-medium">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
