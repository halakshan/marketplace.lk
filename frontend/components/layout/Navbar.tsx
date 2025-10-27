'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  FiBell, FiMenu, FiX, FiUser, FiSearch,
  FiLogOut, FiList, FiPlusCircle, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const CATEGORIES = [
  { slug: 'vehicles',   name: 'Vehicles',         icon: '🚗' },
  { slug: 'property',   name: 'Property',          icon: '🏠' },
  { slug: 'land',       name: 'Land',              icon: '🌳' },
  { slug: 'electronics',name: 'Electronics',       icon: '📱' },
  { slug: 'home-garden',name: 'Home & Garden',     icon: '🛋️' },
  { slug: 'jobs',       name: 'Jobs',              icon: '💼' },
  { slug: 'services',   name: 'Services',          icon: '🔧' },
  { slug: 'animals',    name: 'Animals & Pets',    icon: '🐾' },
  { slug: 'fashion',    name: 'Fashion',           icon: '👗' },
  { slug: 'sports',     name: 'Sports',            icon: '⚽' },
  { slug: 'other',      name: 'Other',             icon: '📦' },
];

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setCatMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user) {
      api.get('/api/notifications').then(res => {
        setUnreadCount(res.data.data?.filter((n: any) => !n.isRead).length || 0);
      }).catch(() => {});
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/ads?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {/* Top bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center font-bold text-white text-base">
                M
              </div>
              <span className="font-extrabold text-primary-600 text-xl hidden sm:block">marketplace<span className="text-gray-800">.lk</span></span>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 hidden md:flex max-w-xl">
              <div className="flex w-full rounded-full border-2 border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search ads..."
                  className="flex-1 px-5 py-2.5 text-base outline-none bg-white"
                />
                <button type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-5 flex items-center transition-colors">
                  <FiSearch size={18} />
                </button>
              </div>
            </form>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Post Ad CTA */}
              <Link href="/post-ad"
                className="hidden sm:flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-full text-base font-bold transition-colors">
                <FiPlusCircle size={17} />
                <span>Post Ad</span>
              </Link>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link href="/notifications"
                    className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors hidden sm:flex">
                    <FiBell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User menu */}
                  <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-1 py-1 px-2 rounded-full hover:bg-gray-100 transition-colors">
                      <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                        {profile?.photoURL
                          ? <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                          : <FiUser size={15} className="text-primary-600" />
                        }
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[90px] truncate">
                        {profile?.displayName?.split(' ')[0] || 'Me'}
                      </span>
                      <FiChevronDown size={13} className="text-gray-400" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50"
                        onMouseLeave={() => setDropdownOpen(false)}>
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-800 truncate">{profile?.displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                        </div>
                        <Link href="/my-ads"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setDropdownOpen(false)}>
                          <FiList size={15} /><span>My Ads</span>
                        </Link>
                        <Link href="/post-ad"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50"
                          onClick={() => setDropdownOpen(false)}>
                          <FiPlusCircle size={15} /><span>Post New Ad</span>
                        </Link>
                        <Link href="/profile"
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setDropdownOpen(false)}>
                          <FiUser size={15} /><span>My Profile</span>
                        </Link>
                        {profile?.role === 'admin' && (
                          <Link href="/admin/dashboard"
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setDropdownOpen(false)}>
                            <FiList size={15} /><span>Admin Panel</span>
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={handleLogout}
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full">
                            <FiLogOut size={15} /><span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="text-sm text-gray-700 hover:text-primary-500 font-medium px-3 py-1.5">Login</Link>
                  <Link href="/register" className="text-sm bg-gray-800 text-white px-4 py-1.5 rounded-full font-medium hover:bg-gray-700 transition-colors">Register</Link>
                </div>
              )}

              {/* Mobile toggle */}
              <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Category bar */}
        <div className="hidden md:block border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/ads?category=${cat.slug}`}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  pathname.includes(cat.slug)
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-primary-600 hover:border-primary-300'
                }`}>
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 bg-white">
            <form onSubmit={handleSearch} className="px-4 mb-3">
              <div className="flex rounded-full border border-gray-300 overflow-hidden">
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search ads..." className="flex-1 px-4 py-2 text-sm outline-none" />
                <button type="submit" className="bg-primary-500 text-white px-4"><FiSearch size={14} /></button>
              </div>
            </form>

            <Link href="/post-ad" onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-2 mx-4 mb-2 bg-primary-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
              <FiPlusCircle size={16} /><span>Post Free Ad</span>
            </Link>

            <div className="border-t border-gray-100 pt-2">
              {CATEGORIES.slice(0, 6).map(cat => (
                <Link key={cat.slug} href={`/ads?category=${cat.slug}`} onClick={() => setMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <span>{cat.icon}</span><span>{cat.name}</span>
                </Link>
              ))}
              <Link href="/ads" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-primary-600 font-medium">View all categories →</Link>
            </div>

            <div className="border-t border-gray-100 pt-2 mt-1">
              {user ? (
                <>
                  <Link href="/my-ads" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Ads</Link>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 border border-primary-500 text-primary-500 rounded-full text-sm font-medium">Login</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 bg-gray-800 text-white rounded-full text-sm font-medium">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
