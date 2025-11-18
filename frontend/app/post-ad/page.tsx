'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiUpload, FiX, FiArrowRight, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  { slug: 'vehicles',    name: 'Vehicles',       icon: '🚗', subcategories: ['Cars', 'Vans & Jeeps', 'Motorcycles & Scooters', 'Buses & Coaches', 'Lorries & Trucks', 'Three-wheelers', 'Boats & Water Transport', 'Other Vehicles'] },
  { slug: 'property',    name: 'Property',       icon: '🏠', subcategories: ['Houses', 'Apartments & Flats', 'Rooms', 'Commercial Property', 'Industrial Property', 'Other Property'] },
  { slug: 'land',        name: 'Land',           icon: '🌳', subcategories: ['Agricultural Land', 'Residential Land', 'Commercial Land', 'Industrial Land', 'Other Land'] },
  { slug: 'electronics', name: 'Electronics',    icon: '📱', subcategories: ['Mobile Phones', 'Computers & Laptops', 'TVs & Monitors', 'Cameras & Accessories', 'Audio & Music', 'Computer Accessories', 'Other Electronics'] },
  { slug: 'home-garden', name: 'Home & Garden',  icon: '🛋️', subcategories: ['Furniture', 'Kitchen Appliances', 'Home Appliances', 'Garden & Outdoor', 'Home Décor', 'Other Home Items'] },
  { slug: 'jobs',        name: 'Jobs',           icon: '💼', subcategories: ['Accounting & Finance', 'IT & Technology', 'Construction', 'Healthcare', 'Education', 'Sales & Marketing', 'Other Jobs'] },
  { slug: 'services',    name: 'Services',       icon: '🔧', subcategories: ['Construction & Renovation', 'Cleaning', 'IT & Computer', 'Photography', 'Transport', 'Education & Tutoring', 'Other Services'] },
  { slug: 'animals',     name: 'Animals & Pets', icon: '🐾', subcategories: ['Dogs', 'Cats', 'Birds', 'Fish & Aquariums', 'Pet Accessories', 'Other Animals'] },
  { slug: 'fashion',     name: 'Fashion',        icon: '👗', subcategories: ["Men's Clothing", "Women's Clothing", 'Kids Clothing', 'Shoes', 'Bags & Accessories', 'Jewellery', 'Other Fashion'] },
  { slug: 'sports',      name: 'Sports',         icon: '⚽', subcategories: ['Cricket', 'Football', 'Fitness Equipment', 'Cycling', 'Water Sports', 'Other Sports'] },
  { slug: 'other',       name: 'Other',          icon: '📦', subcategories: ['Books & Magazines', 'Music & Movies', 'Baby & Kids', 'Toys & Games', 'Art & Collectibles', 'Other'] },
];

const SL_DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Other'];
const TRANSMISSIONS = ['Manual', 'Automatic', 'Semi-Automatic'];
const FURNISHING = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

interface AdForm {
  title: string;
  description: string;
  price: string;
  priceNegotiable: boolean;
  subcategory: string;
  condition: string;
  city: string;
  district: string;
  posterPhone: string;
  posterWhatsapp: string;
  // Vehicle
  make: string; model: string; year: string; mileage: string; fuelType: string; transmission: string;
  // Property/Land
  bedrooms: string; bathrooms: string; floorArea: string; landArea: string; furnishing: string; propertyType: string;
  // General
  brand: string;
}

export default function PostAdPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1=category, 2=details, 3=photos, 4=contact
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isFree, setIsFree] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<AdForm>({
    defaultValues: { condition: 'used', priceNegotiable: false, posterPhone: profile?.phone || '' }
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/post-ad');
  }, [user, authLoading]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (images.length + files.length > 8) { toast.error('Maximum 8 images allowed'); return; }

    e.target.value = ''; // reset so same file can be re-selected

    setUploading(true);
    setUploadProgress(10); // show immediate feedback

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));

      // Use user from useAuth() — always in sync, never null when page is visible
      if (!user) { toast.error('Please log in first'); return; }
      const token = await user.getIdToken(true); // force refresh

      console.log('Token (first 20 chars):', token?.substring(0, 20));
      console.log('Files to upload:', files.length, files.map(f => f.name));
      setUploadProgress(20);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/upload/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      console.log('Upload response status:', res.status);
      setUploadProgress(90);
      const data = await res.json();
      console.log('Upload response data:', data);

      if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);

      setImages(prev => [...prev, ...data.urls]);
      toast.success(`${data.urls.length} photo(s) uploaded`);
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onSubmit = async (data: AdForm) => {
    if (!selectedCategory) { toast.error('Select a category'); setStep(1); return; }
    if (step < 4) { setStep(s => s + 1); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/api/ads', {
        ...data,
        category: selectedCategory.slug,
        categoryName: selectedCategory.name,
        price: isFree ? null : (data.price ? parseFloat(data.price) : null),
        images,
      });
      toast.success('Ad posted successfully! 🎉');
      router.push(`/ads/${res.data.data.id}`);
    } catch {
      toast.error('Failed to post ad. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div></div>
  );

  if (!user) return null;

  const isVehicle = selectedCategory?.slug === 'vehicles';
  const isProperty = selectedCategory?.slug === 'property';
  const isLand = selectedCategory?.slug === 'land';
  const hasSpecs = isVehicle || isProperty || isLand;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Progress */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Post Your Ad</h1>
          <div className="flex items-center gap-2">
            {['Category', 'Details', 'Photos', 'Contact'].map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {done ? <FiCheckCircle size={14} /> : num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary-600' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
                  {i < 3 && <div className={`h-0.5 flex-1 ${step > num ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Step 1: Category */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Choose a category</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map(cat => (
                  <button key={cat.slug} type="button"
                    onClick={() => { setSelectedCategory(cat); setStep(2); }}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:border-primary-400 hover:bg-primary-50 ${
                      selectedCategory?.slug === cat.slug ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50'
                    }`}>
                    <span className="text-3xl mb-2">{cat.icon}</span>
                    <span className="text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && selectedCategory && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCategory.icon}</span>
                  <h2 className="text-lg font-bold text-gray-800">{selectedCategory.name} Details</h2>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ad Title *</label>
                  <input {...register('title', { required: 'Title required', minLength: { value: 10, message: 'At least 10 characters' } })}
                    className="input" placeholder={
                      isVehicle ? 'e.g. Toyota Prius 2018 - Excellent Condition'
                      : isProperty ? 'e.g. 3 Bedroom House in Colombo 5'
                      : isLand ? 'e.g. 20 Perch Land in Kandy'
                      : 'Write a clear, descriptive title'
                    } />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                {/* Subcategory */}
                {selectedCategory.subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
                    <select {...register('subcategory', { required: 'Please select type' })} className="input">
                      <option value="">Select type...</option>
                      {selectedCategory.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subcategory && <p className="text-red-500 text-xs mt-1">{errors.subcategory.message}</p>}
                  </div>
                )}

                {/* Vehicle specific fields */}
                {isVehicle && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Make / Brand</label>
                      <input {...register('make')} className="input" placeholder="e.g. Toyota, Honda" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Model</label>
                      <input {...register('model')} className="input" placeholder="e.g. Prius, Civic" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                      <input {...register('year')} type="number" className="input" placeholder="2020" min="1960" max={new Date().getFullYear()} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mileage (km)</label>
                      <input {...register('mileage')} type="number" className="input" placeholder="50000" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Fuel Type</label>
                      <select {...register('fuelType')} className="input">
                        <option value="">Select...</option>
                        {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Transmission</label>
                      <select {...register('transmission')} className="input">
                        <option value="">Select...</option>
                        {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Property specific fields */}
                {isProperty && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Bedrooms</label>
                      <input {...register('bedrooms')} type="number" className="input" placeholder="3" min="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Bathrooms</label>
                      <input {...register('bathrooms')} type="number" className="input" placeholder="2" min="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Floor Area (sq.ft)</label>
                      <input {...register('floorArea')} type="number" className="input" placeholder="1500" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Furnishing</label>
                      <select {...register('furnishing')} className="input">
                        <option value="">Select...</option>
                        {FURNISHING.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Land specific fields */}
                {isLand && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Land Area (perches)</label>
                    <input {...register('landArea')} type="number" className="input" placeholder="20" />
                  </div>
                )}

                {/* Electronics/other brand */}
                {!isVehicle && !isProperty && !isLand && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Brand <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input {...register('brand')} className="input" placeholder="e.g. Samsung, Apple" />
                  </div>
                )}

                {/* Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Condition *</label>
                  <div className="flex gap-3">
                    {['used', 'new'].map(c => (
                      <label key={c} className="flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 border-gray-200 hover:border-gray-300">
                        <input type="radio" {...register('condition')} value={c} className="sr-only" />
                        <span className="text-sm font-semibold capitalize">{c === 'used' ? '🔄 Used' : '✨ New / Unused'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                  <textarea {...register('description', { required: 'Description required', minLength: { value: 20, message: 'At least 20 characters' } })}
                    className="input resize-none" rows={6}
                    placeholder="Describe your item in detail. Include condition, features, any defects, reason for selling..." />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)}
                        className="w-4 h-4 accent-primary-500" />
                      <span className="text-sm text-gray-600">Give away for free</span>
                    </label>
                    {!isFree && (
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">Rs.</span>
                          <input {...register('price')} type="number" className="input pl-10" placeholder="0" min="0" />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap cursor-pointer">
                          <input type="checkbox" {...register('priceNegotiable')} className="w-4 h-4 accent-primary-500" />
                          Negotiable
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">District *</label>
                    <select {...register('district', { required: 'Select district' })} className="input">
                      <option value="">Select district...</option>
                      {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City / Town *</label>
                    <input {...register('city', { required: 'Enter city' })} className="input" placeholder="e.g. Colombo 3" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                  <FiArrowLeft size={15} /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Next: Add Photos <FiArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Add Photos</h2>
                <p className="text-sm text-gray-500 mb-4">Ads with photos get 10x more views. Upload up to 8 photos.</p>

                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button"
                        onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <FiX size={20} className="text-white" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">Main</span>
                      )}
                    </div>
                  ))}

                  {images.length < 8 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                      <FiUpload size={22} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400 text-center px-1">Upload</span>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Uploading...</span><span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">Drag to reorder • First photo is the main photo • JPG, PNG accepted</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2">
                  <FiArrowLeft size={15} /> Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  Next: Contact Info <FiArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Contact */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="text-lg font-bold text-gray-800">Contact Information</h2>
                <p className="text-sm text-gray-500">This is how buyers will contact you. Your phone number will be shown when buyers click "Show Phone Number".</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input {...register('posterPhone', { required: 'Phone number required' })}
                    className="input" placeholder="e.g. 0771234567" type="tel" />
                  {errors.posterPhone && <p className="text-red-500 text-xs mt-1">{errors.posterPhone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input {...register('posterWhatsapp')} className="input" placeholder="e.g. 0771234567" type="tel" />
                  <p className="text-xs text-gray-400 mt-1">Buyers can contact you via WhatsApp if provided</p>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <p className="font-semibold text-gray-700 mb-2">Ad Summary</p>
                  <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium">{selectedCategory?.icon} {selectedCategory?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Images</span><span className="font-medium">{images.length} photo(s)</span></div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary flex items-center gap-2">
                  <FiArrowLeft size={15} /> Back
                </button>
                <button type="submit" disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {submitting ? 'Posting...' : <><FiCheckCircle size={16} /> Post Ad for Free</>}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <Footer />
    </div>
  );
}
