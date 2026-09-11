import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ordersApi } from '../../api/orders';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Banknote,
  Smartphone,
} from 'lucide-react';

export const CheckoutPage = () => {
  const { items, subtotal, shipping, tax, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Alex Johnson',
    street: '742 Evergreen Terrace',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'United States',
    phone: '+1 (555) 234-5678',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expDate: '12/28',
    cvv: '888',
    cardName: user?.name || 'Alex Johnson',
  });

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-xs text-slate-500 mt-1">Add products before proceeding to checkout.</p>
        <Link to="/products" className="mt-4 inline-block text-xs font-bold text-indigo-600">
          Explore Products
        </Link>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city) {
      toast.error('Please complete the required shipping address fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const paymentLabel =
        paymentMethod === 'card'
          ? `Credit Card (${cardDetails.cardNumber.slice(-8)})`
          : paymentMethod === 'upi'
          ? 'UPI Instant Pay'
          : 'Cash on Delivery';

      const res = await ordersApi.createOrder({
        shippingAddress,
        paymentMethod: paymentLabel,
      });

      if (res.order) {
        toast.success('Order placed successfully! Creator studios notified.');
        await clearCart();
        navigate(`/orders/${res.order.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Dispatch
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your order details with escrow multi-vendor payment protection
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Columns: Forms */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-sm text-slate-900">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>1. Destination Shipping Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Full Recipient Name"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                />
              </div>

              <Input
                label="City"
                required
                value={shippingAddress.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />

              <Input
                label="State / Province"
                required
                value={shippingAddress.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />

              <Input
                label="Postal / ZIP Code"
                required
                value={shippingAddress.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
              />

              <Input
                label="Contact Phone"
                value={shippingAddress.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-sm text-slate-900">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>2. Secure Payment Gateway</span>
            </div>

            {/* Payment Options Selection */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'card', label: 'Credit Card', icon: CreditCard },
                { id: 'upi', label: 'UPI / NetBanking', icon: Smartphone },
                { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col items-center sm:items-start text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Card Form */}
            {paymentMethod === 'card' && (
              <div className="pt-3 space-y-3">
                <Input
                  label="Name on Card"
                  value={cardDetails.cardName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                />
                <Input
                  label="Card Number"
                  value={cardDetails.cardNumber}
                  leftIcon={CreditCard}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={cardDetails.expDate}
                    onChange={(e) => setCardDetails({ ...cardDetails, expDate: e.target.value })}
                  />
                  <Input
                    label="CVV / CVC"
                    placeholder="3 digits"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Scan & Pay via any UPI App</p>
                <p className="mt-1">Google Pay, PhonePe, Paytm, or BHIM QR code will be generated upon confirmation.</p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <p className="font-semibold">Pay upon parcel delivery</p>
                <p className="mt-1">Please have exact currency ready upon courier arrival at your address.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Placement */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-subtle space-y-5 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h3>

          {/* Line items mini preview */}
          <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-slate-100 pr-1">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{item.product?.name}</p>
                    <p className="text-slate-500 text-[11px]">Qty: {item.quantity} × ${Number(item.product?.price).toFixed(2)}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">
                  ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {shipping === 0 ? <span className="text-emerald-600">FREE</span> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-900">${tax.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Due</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isSubmitting}
            rightIcon={ArrowRight}
            className="w-full"
          >
            Place Order (${total.toFixed(2)})
          </Button>

          <div className="text-[11px] text-slate-400 text-center space-y-1">
            <p>By placing this order you agree to the Multi-Vendor Escrow Terms.</p>
            <p className="flex items-center justify-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Purchase Protection
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
