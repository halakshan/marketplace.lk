'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiUser, FiPhone, FiMapPin, FiCamera, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ProfileForm {
  displayName: string;
  phone: string;
  address: string;
  city: string;
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (profile) {
      reset({ displayName: profile.displayName, phone: profile.phone || '', address: profile.address || '', city: profile.city || '' });
      setAvatarUrl(profile.photoURL || '');
    }
  }, [user, profile, authLoading]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const token = await user.getIdToken(true);
      const formData = new FormData();
      formData.append('images', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const url = data.urls[0];
      setAvatarUrl(url);
      await api.put('/api/users/me', { photoURL: url });
      await refreshProfile();
      toast.success('Avatar updated');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await api.put('/api/users/me', { ...data, photoURL: avatarUrl });
      await refreshProfile();
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar */}
          <div className="card flex flex-col items-center py-8">
            <div className="relative mb-4">
              <div className="w-28 h-28 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <FiUser size={44} className="text-primary-400" />
                )}
              </div>
              <label className={`absolute bottom-0 right-0 bg-primary-500 text-white rounded-full p-2.5 cursor-pointer hover:bg-primary-600 transition-colors shadow-md ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FiCamera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
              </label>
            </div>
            <p className="font-bold text-gray-800 text-xl">{profile?.displayName}</p>
            <p className="text-base text-gray-500 mt-1">{profile?.email}</p>
            <span className="mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold capitalize">{profile?.role}</span>
            {uploadingAvatar && <p className="text-sm text-gray-400 mt-2">Uploading...</p>}
          </div>

          {/* Info */}
          <div className="card space-y-5">
            <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>

            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input {...register('displayName', { required: 'Name is required' })} className="input pl-11" placeholder="Your full name" />
              </div>
              {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input {...register('phone')} className="input pl-11" placeholder="0771234567" type="tel" />
              </div>
            </div>

            <div>
              <label className="label">City</label>
              <div className="relative">
                <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input {...register('city')} className="input pl-11" placeholder="Colombo" />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <textarea {...register('address')} className="input resize-none" rows={2} placeholder="Your address..." />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSave size={18} /><span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
