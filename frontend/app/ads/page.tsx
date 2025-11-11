'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/shared/AdCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { Ad } from '@/types';

const CATEGORIES_MAP: Record<string, { name: string; icon: string; subcategories: string[] }> = {
  vehicles:    { name: 'Vehicles',       icon: '🚗', subcategories: ['Cars', 'Vans & Jeeps', 'Motorcycles & Scooters', 'Buses & Coaches', 'Lorries & Trucks', 'Three-wheelers', 'Boats & Water Transport', 'Other Vehicles'] },
  property:    { name: 'Property',       icon: '🏠', subcategories: ['Houses', 'Apartments & Flats', 'Rooms', 'Commercial Property', 'Industrial Property', 'Other Property'] },
  land:        { name: 'Land',           icon: '🌳', subcategories: ['Agricultural Land', 'Residential Land', 'Commercial Land', 'Industrial Land', 'Other Land'] },
  electronics: { name: 'Electronics',    icon: '📱', subcategories: ['Mobile Phones', 'Computers & Laptops', 'TVs & Monitors', 'Cameras & Accessories', 'Audio & Music', 'Computer Accessories', 'Other Electronics'] },
  'home-garden':{ name: 'Home & Garden', icon: '🛋️', subcategories: ['Furniture', 'Kitchen Appliances', 'Home Appliances', 'Garden & Outdoor', 'Home Décor', 'Other Home Items'] },
  jobs:        { name: 'Jobs',           icon: '💼', subcategories: ['Accounting & Finance', 'IT & Technology', 'Construction', 'Healthcare', 'Education', 'Sales & Marketing', 'Other Jobs'] },
  services:    { name: 'Services',       icon: '🔧', subcategories: ['Construction & Renovation', 'Cleaning', 'IT & Computer', 'Photography', 'Transport', 'Education & Tutoring', 'Other Services'] },
  animals:     { name: 'Animals & Pets', icon: '🐾', subcategories: ['Dogs', 'Cats', 'Birds', 'Fish & Aquariums', 'Pet Accessories', 'Other Animals'] },
  fashion:     { name: 'Fashion',        icon: '👗', subcategories: ["Men's Clothing", "Women's Clothing", 'Kids Clothing', 'Shoes', 'Bags & Accessories', 'Jewellery', 'Other Fashion'] },
  sports:      { name: 'Sports',         icon: '⚽', subcategories: ['Cricket', 'Football', 'Fitness Equipment', 'Cycling', 'Water Sports', 'Other Sports'] },
  other:       { name: 'Other',          icon: '📦', subcategories: ['Books & Magazines', 'Music & Movies', 'Baby & Kids', 'Toys & Games', 'Art & Collectibles', 'Other'] },
};

const SL_DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'];

export default function AdsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category   = searchParams.get('category') || '';
  const page       = parseInt(searchParams.get('page') || '1');

  const [search,    setSearch]    = useState(searchParams.get('search') || '');
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [district,  setDistrict]  = useState(searchParams.get('district') || '');
  const [minPrice,  setMinPrice]  = useState(searchParams.get('minPrice') || '');
  const [maxPrice,  setMaxPrice]  = useState(searchParams.get('maxPrice') || '');
  const [sort,      setSort]      = useState(searchParams.get('sort') || 'newest');

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category)    params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);
      if (search)      params.set('search', search);
      if (condition)   params.set('condition', condition);
      if (district)    params.set('district', district);
      if (minPrice)    params.set('minPrice', minPrice);
      if (maxPrice)    params.set('maxPrice', maxPrice);
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '24');

      const res = await api.get(`/api/ads?${params.toString()}`);
      setAds(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [category, subcategory, search, condition, district, minPrice, maxPrice, sort, page]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    params.delete('page'); // reset page on filter change
    router.push(`/ads?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search, subcategory, condition, district, minPrice, maxPrice, sort });
  };

  const clearFilters = () => {
    setSearch(''); setSubcategory(''); setCondition('');
    setDistrict(''); setMinPrice(''); setMaxPrice('');
    router.push(category ? `/ads?category=${category}` : '/ads');
  };

  const catInfo = category ? CATEGORIES_MAP[category] : null;
  const hasFilters = !!(subcategory || condition || district || minPrice || maxPrice || search);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {catInfo ? `${catInfo.icon} ${catInfo.name}` : '🔍 All Ads'}
              </h1>
              {!loading && (
                <p className="text-sm text-gray-500 mt-0.5">{total.toLocaleString()} ads found</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select value={sort} onChange={e => { setSort(e.target.value); updateURL({ sort: e.target.value }); }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400">
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                  showFilters || hasFilters ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                }`}>
                <FiFilter size={14} />
                <span>Filters</span>
                {hasFilters && <span className="bg-white text-primary-600 text-xs font-bold px-1 rounded">!</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1">
        <div className="flex gap-5">

          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56 xl:w-64 flex-shrink-0`}>
            <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 sticky top-20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">Filters</p>
                {hasFilters && (
                  <button type="button" onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-0.5">
                    <FiX size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Keyword</label>
                <div className="relative mt-1">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search..." className="input pl-8 text-sm py-2" />
                </div>
              </div>

              {/* Subcategory */}
              {catInfo && catInfo.subcategories.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
                  <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="input mt-1 text-sm py-2">
                    <option value="">All types</option>
                    {catInfo.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Condition */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</label>
                <div className="flex gap-2 mt-1">
                  {['', 'new', 'used'].map(c => (
                    <button key={c} type="button" onClick={() => setCondition(c)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border font-medium capitalize transition-colors ${
                        condition === c ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}>
                      {c === '' ? 'Any' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* District */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">District</label>
                <select value={district} onChange={e => setDistrict(e.target.value)} className="input mt-1 text-sm py-2">
                  <option value="">All districts</option>
                  {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price Range (Rs.)</label>
                <div className="flex gap-2 mt-1">
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                    placeholder="Min" className="input text-sm py-2 flex-1 min-w-0" />
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    placeholder="Max" className="input text-sm py-2 flex-1 min-w-0" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
                <FiSearch size={14} /> Apply Filters
              </button>
            </form>
          </aside>

          {/* Ad Grid */}
          <div className="flex-1 min-w-0">
            {/* Categories quick-select when no category selected */}
            {!category && (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-2 mb-5">
                {Object.entries(CATEGORIES_MAP).map(([slug, info]) => (
                  <a key={slug} href={`/ads?category=${slug}`}
                    className="flex flex-col items-center p-2 bg-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer">
                    <span className="text-xl">{info.icon}</span>
                    <span className="text-xs font-medium text-gray-600 text-center mt-1 leading-tight">{info.name}</span>
                  </a>
                ))}
              </div>
            )}

            {loading ? (
              <LoadingSpinner size="lg" />
            ) : ads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-semibold text-gray-600">No ads found</p>
                <p className="text-sm text-gray-400 mt-1 mb-5">Try adjusting your filters or search term</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-secondary text-sm">Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <a key={p}
                        href={`/ads?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(p) }).toString()}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === page ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                        }`}>
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
