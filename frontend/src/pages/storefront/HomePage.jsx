import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products';
import { categoriesApi } from '../../api/categories';
import { ProductCard } from '../../components/customer/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  TrendingUp,
  Laptop,
  Headphones,
  Watch,
  Shirt,
  Footprints,
  Armchair,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Laptop: Laptop,
  Headphones: Headphones,
  Watch: Watch,
  Shirt: Shirt,
  Footprints: Footprints,
  Armchair: Armchair,
};

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productsApi.getProducts({ limit: 12 }),
          categoriesApi.getCategories(),
        ]);

        if (prodRes.products) {
          const prods = prodRes.products;
          setFeaturedProducts(prods.filter((p) => p.featured || p.rating >= 4.8).slice(0, 4));
          setBestSellers(prods.filter((p) => p.isBestSeller || p.reviewCount > 25).slice(0, 4));
        }
        if (catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error('Failed to fetch home data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 sm:py-24 border-b border-slate-800">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next-Generation Multi-Vendor Marketplace</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Curated Craftsmanship.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">
                  Direct From Creators.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                Discover exceptional hardware peripherals, precision acoustic gear, and technical apparel from vetted independent studios worldwide.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  size="lg"
                  rightIcon={ArrowRight}
                  onClick={() => navigate('/products')}
                >
                  Explore Catalog
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-slate-800/80 hover:bg-slate-800 text-white border-slate-700"
                  onClick={() => navigate('/products?category=audio')}
                >
                  Browse Audio Gear
                </Button>
              </div>

              {/* Feature Pills */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Escrow Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Verified Merchants</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Real-Time Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
                  alt="Aura Pro Studio Wireless Headphones"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                  <div className="inline-block bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md mb-2 w-max">
                    Featured Studio Drop
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Aura Pro Studio Wireless Headphones
                  </h3>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                    <span className="text-xl font-extrabold text-white">$349.00</span>
                    <Link
                      to="/products/1"
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Curated equipment and essentials categorized for focused browsing
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.icon] || Laptop;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-card-hover transition-all duration-200 flex flex-col items-center text-center shadow-subtle"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-indigo-50 border border-slate-100 group-hover:border-indigo-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 mt-1 font-medium">
                  {cat.count || 18}+ items
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <Zap className="w-3.5 h-3.5" /> Handpicked Collection
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Merchant Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-indigo-900 text-white overflow-hidden p-8 sm:p-12 border border-indigo-800 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              Join Our Multi-Vendor Marketplace
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Are you a specialized maker, studio, or craft brand?
            </h2>
            <p className="text-sm text-indigo-200 leading-relaxed font-normal">
              List your catalog directly to thousands of high-intent customers with built-in escrow, automated shipping tracking, and comprehensive merchant analytics.
            </p>
            <div className="pt-2">
              <Button
                variant="white"
                rightIcon={ArrowRight}
                onClick={() => navigate('/vendor')}
              >
                Access Vendor Portal
              </Button>
            </div>
          </div>
          <div className="hidden lg:block absolute right-10 -bottom-10 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> High Customer Demand
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Best-Selling Products
            </h2>
          </div>
          <Link
            to="/products?sort=price_desc"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            See Top Sellers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
