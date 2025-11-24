'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  { slug: 'vehicles',    name: 'Vehicles',       subcategories: ['Cars', 'Vans & Jeeps', 'Motorcycles & Scooters', 'Buses & Coaches', 'Lorries & Trucks', 'Three-wheelers', 'Boats & Water Transport', 'Other Vehicles'] },
  { slug: 'property',    name: 'Property',       subcategories: ['Houses', 'Apartments & Flats', 'Rooms', 'Commercial Property', 'Industrial Property', 'Other Property'] },
  { slug: 'land',        name: 'Land',           subcategories: ['Agricultural Land', 'Residential Land', 'Commercial Land', 'Industrial Land', 'Other Land'] },
  { slug: 'electronics', name: 'Electronics',    subcategories: ['Mobile Phones', 'Computers & Laptops', 'TVs & Monitors', 'Cameras & Accessories', 'Audio & Music', 'Computer Accessories', 'Other Electronics'] },
  { slug: 'home-garden', name: 'Home & Garden',  subcategories: ['Furniture', 'Kitchen Appliances', 'Home Appliances', 'Garden & Outdoor', 'Home Décor', 'Other Home Items'] },
  { slug: 'jobs',        name: 'Jobs',           subcategories: ['Accounting & Finance', 'IT & Technology', 'Construction', 'Healthcare', 'Education', 'Sales & Marketing', 'Other Jobs'] },
  { slug: 'services',    name: 'Services',       subcategories: ['Construction & Renovation', 'Cleaning', 'IT & Computer', 'Photography', 'Transport', 'Education & Tutoring', 'Other Services'] },
  { slug: 'animals',     name: 'Animals & Pets', subcategories: ['Dogs', 'Cats', 'Birds', 'Fish & Aquariums', 'Pet Accessories', 'Other Animals'] },
  { slug: 'fashion',     name: 'Fashion',        subcategories: ["Men's Clothing", "Women's Clothing", 'Kids Clothing', 'Shoes', 'Bags & Accessories', 'Jewellery', 'Other Fashion'] },
  { slug: 'sports',      name: 'Sports',         subcategories: ['Cricket', 'Football', 'Fitness Equipment', 'Cycling', 'Water Sports', 'Other Sports'] },
  { slug: 'other',       name: 'Other',          subcategories: ['Books & Magazines', 'Music & Movies', 'Baby & Kids', 'Toys & Games', 'Art & Collectibles', 'Other'] },
];

const SL_DISTRICTS = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'];

export default function EditAdPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [pageLoading, setPageLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [adCategory, setAdCategory] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    api.get(`/api/ads/${id}`).then(r => {
      const a = r.data.data;
      setImages(a.images || []);
      setAdCategory(a.category);
      setIsFree(a.price === null);
      reset({
        title: a.title, description: a.description, price: a.price ?? '',
        priceNegotiable: a.priceNegotiable, subcategory: a.subcategory,
        condition: a.condition, city: a.city, district: a.district,
        posterPhone: a.posterPhone, posterWhatsapp: a.posterWhatsapp || '',
        make: a.make || '', model: a.model || '', year: a.year || '',
        mileage: a.mileage || '', fuelType: a.fuelType || '', transmission: a.transmission || '',
        bedrooms: a.bedrooms || '', bathrooms: a.bathrooms || '',
        floorArea: a.floorArea || '', landArea: a.landArea || '',
        furnishing: a.furnishing || '', brand: a.brand || '',
      });
    }).catch(() => { toast.error('Ad not found'); router.push('/my-ads'); })
    .finally(() => setPageLoading(false));
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) { toast.error('Max 8 images'); return; }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const r = ref(storage, `ads/${user!.uid}/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(r, file);
        await new Promise<void>((res, rej) => {
          task.on('state_changed', null, rej, async () => { urls.push(await getDownloadURL(task.snapshot.ref)); res(); });
        });
      }
      setImages(prev => [...prev, ...urls]);
      toast.success('Uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await api.put(`/api/ads/${id}`, {
        ...data,
        price: isFree ? null : (data.price ? parseFloat(data.price) : null),
        images,
      });
      toast.success('Ad updated!');
      router.push('/my-ads');
    } catch { toast.error('Failed to update'); }
    finally { setSubmitting(false); }
  };

  const cat = CATEGORIES.find(c => c.slug === adCategory);
  const isVehicle  = adCategory === 'vehicles';
  const isProperty = adCategory === 'property';
  const isLand     = adCategory === 'land';

  if (pageLoading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div></div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-200 text-gray-600 transition-colors">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Ad</h1>
            <p className="text-sm text-gray-500">Update your ad details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Photos */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-800 mb-3">Photos</h2>
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <FiX size={20} className="text-white" />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded">Main</span>}
                </div>
              ))}
              {images.length < 8 && (
                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                  <FiUpload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-800">Ad Details</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
              <input {...register('title', { required: true })} className="input" />
            </div>

            {cat && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select {...register('subcategory')} className="input">
                  <option value="">Select type</option>
                  {cat.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {isVehicle && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Make</label><input {...register('make')} className="input" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Model</label><input {...register('model')} className="input" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Year</label><input {...register('year')} type="number" className="input" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Mileage (km)</label><input {...register('mileage')} type="number" className="input" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Fuel</label>
                  <select {...register('fuelType')} className="input"><option value="">-</option>{['Petrol','Diesel','Electric','Hybrid','Other'].map(f=><option key={f}>{f}</option>)}</select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Transmission</label>
                  <select {...register('transmission')} className="input"><option value="">-</option>{['Manual','Automatic','Semi-Automatic'].map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
            )}

            {isProperty && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Bedrooms</label><input {...register('bedrooms')} type="number" className="input" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Bathrooms</label><input {...register('bathrooms')} type="number" className="input" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Floor Area (sq.ft)</label><input {...register('floorArea')} type="number" className="input" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Furnishing</label>
                  <select {...register('furnishing')} className="input"><option value="">-</option>{['Furnished','Semi-Furnished','Unfurnished'].map(f=><option key={f}>{f}</option>)}</select></div>
              </div>
            )}

            {isLand && (
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Land Area (perches)</label><input {...register('landArea')} type="number" className="input" /></div>
            )}

            {!isVehicle && !isProperty && !isLand && (
              <div><label className="text-sm font-semibold text-gray-700 mb-1 block">Brand</label><input {...register('brand')} className="input" /></div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Condition</label>
              <div className="flex gap-3">
                {['used', 'new'].map(c => (
                  <label key={c} className="flex-1 flex items-center justify-center gap-2 p-2.5 border-2 rounded-xl cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 border-gray-200">
                    <input type="radio" {...register('condition')} value={c} className="sr-only" />
                    <span className="text-sm font-medium capitalize">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
              <textarea {...register('description', { required: true })} className="input resize-none" rows={5} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
              <label className="flex items-center gap-2 mb-2 cursor-pointer text-sm">
                <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} className="w-4 h-4 accent-primary-500" />
                Give for free
              </label>
              {!isFree && (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">Rs.</span>
                    <input {...register('price')} type="number" className="input pl-10" />
                  </div>
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer">
                    <input type="checkbox" {...register('priceNegotiable')} className="w-4 h-4 accent-primary-500" /> Negotiable
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">District *</label>
                <select {...register('district', { required: true })} className="input">
                  <option value="">Select...</option>
                  {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                <input {...register('city', { required: true })} className="input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                <input {...register('posterPhone', { required: true })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
                <input {...register('posterWhatsapp')} className="input" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting || uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiSave size={15} /> {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
