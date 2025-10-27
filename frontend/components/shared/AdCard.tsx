'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiClock, FiEye } from 'react-icons/fi';
import { Ad } from '@/types';

interface Props { ad: Ad; compact?: boolean; }

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
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24)  return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function AdCard({ ad, compact = false }: Props) {
  return (
    <Link href={`/ads/${ad.id}`}>
      <div className={`bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 overflow-hidden group ${ad.isFeatured ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}`}>

        {/* Image */}
        <div className={`relative bg-gray-100 overflow-hidden ${compact ? 'h-40' : 'h-48'}`}>
          {ad.images?.[0] ? (
            <Image
              src={ad.images[0]}
              alt={ad.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-50">
              {ad.category === 'vehicles' ? '🚗'
                : ad.category === 'property' || ad.category === 'land' ? '🏠'
                : ad.category === 'electronics' ? '📱'
                : '📦'}
            </div>
          )}

          {/* Featured badge */}
          {ad.isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}

          {/* Condition badge */}
          <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
            ad.condition === 'new' ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'
          }`}>
            {ad.condition}
          </span>

          {/* Image count */}
          {ad.images?.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded-md">
              📷 {ad.images.length}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5">
          <p className="text-sm text-primary-500 font-semibold mb-1 capitalize">
            {ad.categoryName}{ad.subcategory ? ` › ${ad.subcategory}` : ''}
          </p>

          <h3 className="text-base font-bold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-primary-600 transition-colors">
            {ad.title}
          </h3>

          {/* Vehicle specs */}
          {ad.category === 'vehicles' && (ad.year || ad.mileage) && (
            <p className="text-sm text-gray-500 mb-2 font-medium">
              {[ad.year, ad.mileage ? `${ad.mileage.toLocaleString()} km` : null, ad.fuelType].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Property specs */}
          {ad.category === 'property' && (ad.bedrooms || ad.floorArea) && (
            <p className="text-sm text-gray-500 mb-2 font-medium">
              {[ad.bedrooms ? `${ad.bedrooms} bed` : null, ad.bathrooms ? `${ad.bathrooms} bath` : null, ad.floorArea ? `${ad.floorArea} sq.ft` : null].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Land area */}
          {ad.category === 'land' && ad.landArea && (
            <p className="text-sm text-gray-500 mb-2 font-medium">{ad.landArea} perches</p>
          )}

          {/* Price */}
          <div className="mb-2.5">
            {ad.price !== null && ad.price !== undefined ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-primary-600">
                  Rs. {ad.price.toLocaleString()}
                </span>
                {ad.priceNegotiable && (
                  <span className="text-xs text-gray-400 font-semibold">Negotiable</span>
                )}
              </div>
            ) : (
              <span className="text-base font-bold text-green-600">Free</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2.5 border-t border-gray-100">
            <div className="flex items-center gap-1 min-w-0">
              <FiMapPin size={12} className="flex-shrink-0" />
              <span className="truncate font-medium">{ad.city}{ad.district ? `, ${ad.district}` : ''}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              {ad.views > 0 && (
                <span className="flex items-center gap-1">
                  <FiEye size={12} /><span>{ad.views}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiClock size={12} /><span>{timeAgo(ad.createdAt)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
