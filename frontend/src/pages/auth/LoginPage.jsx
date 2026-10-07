import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
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
