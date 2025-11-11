'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiArrowRight, FiStar, FiShield, FiPhone } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/shared/AdCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { Ad } from '@/types';

const CATEGORIES = [
  { slug: 'vehicles',    name: 'Vehicles',       icon: '🚗', color: 'bg-blue-50   hover:bg-blue-100   text-blue-700   border-blue-100' },
  { slug: 'property',    name: 'Property',       icon: '🏠', color: 'bg-green-50  hover:bg-green-100  text-green-700  border-green-100' },
  { slug: 'land',        name: 'Land',           icon: '🌳', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100' },
  { slug: 'electronics', name: 'Electronics',    icon: '📱', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-100' },
  { slug: 'home-garden', name: 'Home & Garden',  icon: '🛋️', color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-100' },
  { slug: 'jobs',        name: 'Jobs',           icon: '💼', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-100' },
  { slug: 'services',    name: 'Services',       icon: '🔧', color: 'bg-red-50    hover:bg-red-100    text-red-700    border-red-100' },
  { slug: 'animals',     name: 'Animals & Pets', icon: '🐾', color: 'bg-pink-50   hover:bg-pink-100   text-pink-700   border-pink-100' },
  { slug: 'fashion',     name: 'Fashion',        icon: '👗', color: 'bg-rose-50   hover:bg-rose-100   text-rose-700   border-rose-100' },
  { slug: 'sports',      name: 'Sports',         icon: '⚽', color: 'bg-lime-50   hover:bg-lime-100   text-lime-700   border-lime-100' },
  { slug: 'other',       name: 'Other',          icon: '📦', color: 'bg-gray-50   hover:bg-gray-100   text-gray-700   border-gray-100' },
];

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  const [latestAds, setLatestAds] = useState<Ad[]>([]);
  const [adsByCategory, setAdsByCategory] = useState<Record<string, Ad[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featured, latest, vehicles, property, electronics] = await Promise.all([
          api.get('/api/ads/featured').catch(() => ({ data: { data: [] } })),
          api.get('/api/ads?limit=8&sort=newest').catch(() => ({ data: { data: [] } })),
          api.get('/api/ads?category=vehicles&limit=4').catch(() => ({ data: { data: [] } })),
          api.get('/api/ads?category=property&limit=4').catch(() => ({ data: { data: [] } })),
          api.get('/api/ads?category=electronics&limit=4').catch(() => ({ data: { data: [] } })),
        ]);
        setFeaturedAds(featured.data.data);
        setLatestAds(latest.data.data);
        setAdsByCategory({
          vehicles: vehicles.data.data,
          property: property.data.data,
          electronics: electronics.data.data,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedCat) params.set('category', selectedCat);
    router.push(`/ads?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-14 lg:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight">
            Buy &amp; Sell Anything in<br />
            <span className="text-yellow-300">Sri Lanka</span>
          </h1>
          <p className="text-orange-100 mb-8 text-lg sm:text-xl font-medium">
            Post your ad free. Contact sellers directly by phone.
          </p>

          {/* Search box */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="text-base text-gray-700 bg-transparent px-3 py-3 rounded-xl border border-gray-200 sm:border-0 focus:outline-none sm:w-48 flex-shrink-0 font-medium">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
            </select>
            <div className="flex flex-1 rounded-xl overflow-hidden border border-gray-200">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3 text-base text-gray-800 outline-none"
              />
              <button type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 flex items-center gap-2 transition-colors font-bold text-base">
                <FiSearch size={18} /><span className="hidden sm:block">Search</span>
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-8 mt-7 text-sm sm:text-base text-orange-100 font-medium">
            <span className="flex items-center gap-2"><FiShield size={16} />Free to post</span>
            <span className="flex items-center gap-2"><FiPhone size={16} />Contact directly</span>
            <span className="flex items-center gap-2"><FiStar size={16} />Trusted by thousands</span>
          </div>
        </div>
      </section>

      {/* ── Categories grid ── */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-2">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/ads?category=${cat.slug}`}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${cat.color}`}>
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs sm:text-sm font-semibold text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {loading ? <LoadingSpinner size="lg" /> : (
          <>
            {/* Featured ads */}
            {featuredAds.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-yellow-400">⭐</span> Featured Ads
                  </h2>
                  <Link href="/ads?featured=true" className="text-base text-primary-600 hover:underline font-semibold flex items-center gap-1">
                    View all <FiArrowRight size={15} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
                </div>
              </section>
            )}

            {/* Latest ads */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-800">🕐 Latest Ads</h2>
                <Link href="/ads" className="text-base text-primary-600 hover:underline font-semibold flex items-center gap-1">
                  View all <FiArrowRight size={15} />
                </Link>
              </div>
              {latestAds.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {latestAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-5xl mb-4">📋</p>
                  <p className="text-xl font-bold text-gray-500 mb-2">No ads posted yet</p>
                  <p className="text-base text-gray-400 mb-6">Be the first to post an ad!</p>
                  <Link href="/post-ad" className="btn-primary">Post Free Ad</Link>
                </div>
              )}
            </section>

            {/* Vehicles */}
            {adsByCategory.vehicles?.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">🚗 Vehicles</h2>
                  <Link href="/ads?category=vehicles" className="text-base text-primary-600 hover:underline font-semibold flex items-center gap-1">
                    View all <FiArrowRight size={15} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {adsByCategory.vehicles.map(ad => <AdCard key={ad.id} ad={ad} />)}
                </div>
              </section>
            )}

            {/* Property */}
            {adsByCategory.property?.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">🏠 Property</h2>
                  <Link href="/ads?category=property" className="text-base text-primary-600 hover:underline font-semibold flex items-center gap-1">
                    View all <FiArrowRight size={15} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {adsByCategory.property.map(ad => <AdCard key={ad.id} ad={ad} />)}
                </div>
              </section>
            )}

            {/* Electronics */}
            {adsByCategory.electronics?.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-800">📱 Electronics</h2>
                  <Link href="/ads?category=electronics" className="text-base text-primary-600 hover:underline font-semibold flex items-center gap-1">
                    View all <FiArrowRight size={15} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {adsByCategory.electronics.map(ad => <AdCard key={ad.id} ad={ad} />)}
                </div>
              </section>
            )}

            {/* CTA banner */}
            <section className="bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl p-10 text-white text-center">
              <h2 className="text-3xl font-bold mb-3">Have something to sell?</h2>
              <p className="text-orange-100 mb-6 text-lg">Post your ad for free and reach thousands of buyers across Sri Lanka.</p>
              <Link href="/post-ad"
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg">
                Post Free Ad <FiArrowRight size={20} />
              </Link>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
