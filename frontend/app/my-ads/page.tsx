'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiMapPin, FiClock,
  FiCheckCircle, FiXCircle, FiRefreshCw, FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { Ad } from '@/types';
import { useAuth } from '@/context/AuthContext';

function timeAgo(ts: any): string {
  if (!ts) return '';
  const d = ts?.toDate
    ? ts.toDate()
    : ts?._seconds
      ? new Date(ts._seconds * 1000)
      : typeof ts === 'string' || typeof ts === 'number'
        ? new Date(ts)
        : ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return '';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  active:  { label: 'Active',  color: 'bg-green-100 text-green-700',  icon: FiCheckCircle },
  sold:    { label: 'Sold',    color: 'bg-blue-100 text-blue-700',    icon: FiCheckCircle },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-600',    icon: FiClock },
  deleted: { label: 'Deleted', color: 'bg-red-100 text-red-600',      icon: FiXCircle },
};

export default function MyAdsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user) {
      api.get('/api/ads/my')
        .then(r => setAds(r.data.data))
        .catch(() => toast.error('Failed to load ads'))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const handleMarkSold = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/ads/${id}/status`, { status: 'sold' });
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: 'sold' } : a));
      toast.success('Marked as sold');
    } catch { toast.error('Failed to update'); }
    finally { setActionId(null); }
  };

  const handleReactivate = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/ads/${id}/status`, { status: 'active' });
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
      toast.success('Ad reactivated');
    } catch { toast.error('Failed to reactivate'); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    setActionId(id);
    try {
      await api.delete(`/api/ads/${id}`);
      setAds(prev => prev.filter(a => a.id !== id));
      toast.success('Ad deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setActionId(null); }
  };

  const filtered = statusFilter === 'all' ? ads : ads.filter(a => a.status === statusFilter);
  const counts = {
    all: ads.length,
    active: ads.filter(a => a.status === 'active').length,
    sold: ads.filter(a => a.status === 'sold').length,
    expired: ads.filter(a => a.status === 'expired').length,
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div></div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Ads</h1>
            <p className="text-sm text-gray-500 mt-0.5">{counts.all} total ads</p>
          </div>
          <Link href="/post-ad" className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> Post New Ad
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Active',  count: counts.active,  color: 'text-green-600 bg-green-50 border-green-100' },
            { label: 'Sold',    count: counts.sold,    color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { label: 'Total',   count: counts.all,     color: 'text-gray-700 bg-gray-50 border-gray-100' },
            { label: 'Expired', count: counts.expired, color: 'text-orange-600 bg-orange-50 border-orange-100' },
          ].map(s => (
            <div key={s.label} className={`border rounded-xl p-4 text-center ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'active', 'sold', 'expired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}>
              {s === 'all' ? `All (${counts.all})` : `${s} (${(counts as any)[s] || 0})`}
            </button>
          ))}
        </div>

        {/* Ad list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <FiPackage size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold text-gray-500">
              {statusFilter === 'all' ? 'No ads posted yet' : `No ${statusFilter} ads`}
            </p>
            <p className="text-sm text-gray-400 mt-1 mb-5">
              {statusFilter === 'all' ? 'Post your first ad to start selling' : 'Change filter to see other ads'}
            </p>
            {statusFilter === 'all' && (
              <Link href="/post-ad" className="btn-primary">Post Your First Ad</Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(ad => {
              const cfg = STATUS_CONFIG[ad.status] || STATUS_CONFIG.active;
              const StatusIcon = cfg.icon;
              const isLoading = actionId === ad.id;

              return (
                <div key={ad.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    {/* Image */}
                    <div className="relative w-28 sm:w-36 flex-shrink-0 bg-gray-100">
                      {ad.images?.[0] ? (
                        <Image src={ad.images[0]} alt={ad.title} fill className="object-cover" sizes="144px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl min-h-[100px]">
                          {ad.category === 'vehicles' ? '🚗' : ad.category === 'property' ? '🏠' : '📦'}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                              <StatusIcon size={10} />
                              {cfg.label}
                            </span>
                            {ad.isFeatured && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">⭐ Featured</span>
                            )}
                          </div>
                          <Link href={`/ads/${ad.id}`}>
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1 hover:text-primary-600 transition-colors">
                              {ad.title}
                            </h3>
                          </Link>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {ad.price !== null && ad.price !== undefined ? (
                            <p className="font-extrabold text-primary-600">Rs. {ad.price.toLocaleString()}</p>
                          ) : (
                            <p className="font-bold text-green-600">Free</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1"><FiMapPin size={11} />{ad.city}{ad.district ? `, ${ad.district}` : ''}</span>
                        <span className="flex items-center gap-1"><FiEye size={11} />{ad.views} views</span>
                        <span className="flex items-center gap-1"><FiClock size={11} />{timeAgo(ad.createdAt)}</span>
                        <span className="capitalize text-gray-500">{ad.categoryName}{ad.subcategory ? ` › ${ad.subcategory}` : ''}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/ads/${ad.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                          <FiEye size={12} /> View
                        </Link>
                        <Link href={`/my-ads/${ad.id}/edit`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                          <FiEdit2 size={12} /> Edit
                        </Link>
                        {ad.status === 'active' && (
                          <button onClick={() => handleMarkSold(ad.id)} disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50">
                            <FiCheckCircle size={12} /> Mark Sold
                          </button>
                        )}
                        {(ad.status === 'sold' || ad.status === 'expired') && (
                          <button onClick={() => handleReactivate(ad.id)} disabled={isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50">
                            <FiRefreshCw size={12} /> Reactivate
                          </button>
                        )}
                        <button onClick={() => handleDelete(ad.id)} disabled={isLoading}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50">
                          <FiTrash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
