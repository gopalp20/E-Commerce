import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Mail, Lock, User, Store, ShieldAlert } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' or 'VENDOR'
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      const user = await register({ name, email, password, role });
      if (user) {
        if (user.role === 'VENDOR') navigate('/vendor');
        else navigate('/');
      }
    } catch (err) {
      // Handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-xl text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm">
              M
            </div>
            <span>Market<span className="text-indigo-600">Pulse</span></span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Your Account</h2>
          <p className="text-xs text-slate-500">
            Join as a buyer or independent merchant on the marketplace
          </p>
        </div>

        {/* Account Role Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-xs font-semibold transition-all ${
                role === 'CUSTOMER'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <User className={`w-4 h-4 ${role === 'CUSTOMER' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <p className="leading-tight">Customer</p>
                <p className="text-[10px] text-slate-500 font-normal">Buy & Review</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-xs font-semibold transition-all ${
                role === 'VENDOR'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
              }`}
            >
              <Store className={`w-4 h-4 ${role === 'VENDOR' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <p className="leading-tight">Vendor</p>
                <p className="text-[10px] text-slate-500 font-normal">Sell & Ship</p>
              </div>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name / Store Representative"
            required
            placeholder="Jane Doe"
            leftIcon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="jane@example.com"
            leftIcon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="At least 6 characters"
            leftIcon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="Repeat password"
            leftIcon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Create {role === 'VENDOR' ? 'Vendor' : 'Customer'} Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
