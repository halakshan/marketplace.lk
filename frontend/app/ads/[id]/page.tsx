'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiPhone, FiMessageSquare, FiMapPin, FiClock, FiEye,
  FiShare2, FiFlag, FiChevronLeft, FiChevronRight,
  FiArrowLeft, FiCheckCircle, FiTag
} from 'react-icons/fi';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdCard from '@/components/shared/AdCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { Ad } from '@/types';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

function timeAgo(ts: any): string {
  if (!ts) return '';
  const d = ts?.toDate
    ? ts.toDate()
    : ts?._seconds
      ? new Date(ts._seconds * 1000)
      : typeof ts === 'string' || typeof ts === 'number'
        ? new Date(ts)
        : ts instanceof Date
          ? ts
          : new Date(ts);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins} minutes ago`;
  if (hrs < 24)   return `${hrs} hours ago`;
  if (days < 7)   return `${days} days ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function AdDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [ad, setAd] = useState<Ad | null>(null);
  const [relatedAds, setRelatedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/ads/${id}`).then(res => {
      setAd(res.data.data);
      // fetch related
      return api.get(`/api/ads?category=${res.data.data.category}&limit=5`).catch(() => ({ data: { data: [] } }));
    }).then(rel => {
      setRelatedAds((rel.data.data as Ad[]).filter(a => a.id !== id).slice(0, 4));
    }).catch(() => {
      toast.error('Ad not found');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: ad?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const prevImg = () => setActiveImg(i => (i === 0 ? (ad!.images.length - 1) : i - 1));
  const nextImg = () => setActiveImg(i => (i === ad!.images.length - 1 ? 0 : i + 1));

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
    </div>
  );

  if (!ad) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-5xl">🔍</p>
        <p className="text-xl font-semibold text-gray-600">Ad not found</p>
        <Link href="/ads" className="btn-primary">Browse Ads</Link>
      </div>
    </div>
  );

  const specs: { label: string; value: string | number | null | undefined }[] = [
    { label: 'Category',     value: `${ad.categoryName}${ad.subcategory ? ` › ${ad.subcategory}` : ''}` },
    { label: 'Condition',    value: ad.condition },
    // Vehicle
    ad.make        && { label: 'Make',         value: ad.make },
    ad.model       && { label: 'Model',        value: ad.model },
    ad.year        && { label: 'Year',         value: ad.year },
    ad.mileage     && { label: 'Mileage',      value: `${ad.mileage.toLocaleString()} km` },
    ad.fuelType    && { label: 'Fuel Type',    value: ad.fuelType },
    ad.transmission && { label: 'Transmission', value: ad.transmission },
    // Property
    ad.propertyType && { label: 'Type',        value: ad.propertyType },
    ad.bedrooms    && { label: 'Bedrooms',     value: ad.bedrooms },
    ad.bathrooms   && { label: 'Bathrooms',    value: ad.bathrooms },
    ad.floorArea   && { label: 'Floor Area',   value: `${ad.floorArea} sq.ft` },
    ad.furnishing  && { label: 'Furnishing',   value: ad.furnishing },
    // Land
    ad.landArea    && { label: 'Land Area',    value: `${ad.landArea} perches` },
    // General
    ad.brand       && { label: 'Brand',        value: ad.brand },
    { label: 'Location',     value: `${ad.city}${ad.district ? `, ${ad.district}` : ''}` },
    { label: 'Posted',       value: timeAgo(ad.createdAt) },
    { label: 'Views',        value: `${ad.views} views` },
  ].filter(Boolean) as { label: string; value: string | number }[];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-500">Home</Link>
          <span>/</span>
          <Link href="/ads" className="hover:text-primary-500">Ads</Link>
          {ad.category && <>
            <span>/</span>
            <Link href={`/ads?category=${ad.category}`} className="hover:text-primary-500 capitalize">{ad.categoryName}</Link>
          </>}
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{ad.title}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: images + details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Back button mobile */}
            <button onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 lg:hidden">
              <FiArrowLeft size={15} /> Back
            </button>

            {/* Photo Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {/* Main image */}
              <div className="relative bg-gray-100" style={{ height: '380px' }}>
                {ad.images?.length > 0 ? (
                  <>
                    <Image
                      src={ad.images[activeImg]}
                      alt={ad.title}
                      fill
                      className="object-contain cursor-zoom-in"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      onClick={() => setLightboxOpen(true)}
                      priority
                    />
                    {ad.images.length > 1 && (
                      <>
                        <button onClick={prevImg}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors">
                          <FiChevronLeft size={20} />
                        </button>
                        <button onClick={nextImg}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors">
                          <FiChevronRight size={20} />
                        </button>
                        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {activeImg + 1} / {ad.images.length}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {ad.category === 'vehicles' ? '🚗' : ad.category === 'property' ? '🏠' : '📦'}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {ad.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t border-gray-100">
                  {ad.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-primary-500' : 'border-transparent hover:border-gray-300'}`}>
                      <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  {ad.isFeatured && (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      ⭐ Featured Ad
                    </span>
                  )}
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">{ad.title}</h1>
                </div>
                <button onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors flex-shrink-0">
                  <FiShare2 size={18} />
                </button>
              </div>

              {/* Price */}
              <div className="mb-4">
                {ad.price !== null && ad.price !== undefined ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-primary-600">
                      Rs. {ad.price.toLocaleString()}
                    </span>
                    {ad.priceNegotiable && (
                      <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
                        Negotiable
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-3xl font-extrabold text-green-600">Free</span>
                )}
              </div>

              {/* Quick info */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><FiMapPin size={14} />{ad.city}{ad.district ? `, ${ad.district}` : ''}</span>
                <span className="flex items-center gap-1"><FiClock size={14} />{timeAgo(ad.createdAt)}</span>
                <span className="flex items-center gap-1"><FiEye size={14} />{ad.views} views</span>
                <span className={`flex items-center gap-1 capitalize font-medium px-2 py-0.5 rounded-full text-xs ${
                  ad.condition === 'new' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  <FiTag size={11} />{ad.condition}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-800 mb-3">Description</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{ad.description}</p>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-bold text-gray-800 mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-3">
                  {specs.map(({ label, value }) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                      <span className="text-sm font-medium text-gray-700 capitalize mt-0.5">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety tips */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1.5">
                <FiCheckCircle size={15} /> Safety Tips
              </p>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>Meet the seller in a public place</li>
                <li>Inspect the item before paying</li>
                <li>Don't send money in advance</li>
                <li>Be cautious of deals that seem too good</li>
              </ul>
            </div>
          </div>

          {/* Right: contact + poster */}
          <div className="space-y-4">
            {/* Sticky contact card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-lg flex-shrink-0">
                  {ad.posterName?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{ad.posterName || 'Seller'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FiMapPin size={11} />{ad.city || 'Sri Lanka'}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-0.5 flex items-center gap-1">
                    <FiCheckCircle size={11} />Member
                  </p>
                </div>
              </div>

              {/* Phone reveal */}
              {phoneRevealed ? (
                <a href={`tel:${ad.posterPhone}`}
                  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-base transition-colors mb-3">
                  <FiPhone size={18} /> {ad.posterPhone}
                </a>
              ) : (
                <button
                  onClick={() => {
                    if (!user) { router.push('/login'); return; }
                    setPhoneRevealed(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-base transition-colors mb-3">
                  <FiPhone size={18} /> Show Phone Number
                </button>
              )}

              {/* WhatsApp */}
              {ad.posterWhatsapp && (
                <a
                  href={`https://wa.me/94${ad.posterWhatsapp.replace(/^0/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your ad: ${ad.title} - ${window?.location?.href || ''}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bc5a] text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}

              {!user && (
                <p className="text-xs text-center text-gray-400 mt-3">
                  <Link href="/login" className="text-primary-500 font-medium hover:underline">Login</Link> to see contact details
                </p>
              )}

              {/* Report */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
                  <FiFlag size={12} /> Report this ad
                </button>
              </div>
            </div>

            {/* Owner's other ads link */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">More from <span className="font-semibold text-gray-700">{ad.posterName}</span></p>
              <Link href={`/ads?userId=${ad.userId}`}
                className="text-sm text-primary-600 hover:underline font-medium">View all their ads →</Link>
            </div>
          </div>
        </div>

        {/* Related ads */}
        {relatedAds.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Similar Ads</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedAds.map(a => <AdCard key={a.id} ad={a} />)}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxOpen && ad.images?.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
            onClick={e => { e.stopPropagation(); prevImg(); }}>
            <FiChevronLeft size={24} />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh]" onClick={e => e.stopPropagation()}>
            <Image src={ad.images[activeImg]} alt={ad.title} fill className="object-contain" sizes="100vw" />
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
            onClick={e => { e.stopPropagation(); nextImg(); }}>
            <FiChevronRight size={24} />
          </button>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-light">✕</button>
          <p className="absolute bottom-4 text-white/60 text-sm">{activeImg + 1} / {ad.images.length}</p>
        </div>
      )}

      <Footer />
    </div>
  );
}
