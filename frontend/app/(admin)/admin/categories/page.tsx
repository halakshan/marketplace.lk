'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Category } from '@/types';

interface CatForm { name: string; description: string; }

export default function AdminCategoriesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CatForm>();

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') { router.push('/'); return; }
    api.get('/api/categories').then(r => setCategories(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user, profile, authLoading]);

  const onSubmit = async (data: CatForm) => {
    setSaving(true);
    try {
      const res = await api.post('/api/categories', data);
      const newCat: Category = { id: res.data.data.id, ...data, slug: data.name.toLowerCase().replace(/\s+/g, '-'), isActive: true, adCount: 0, icon: '📦', subcategories: [] };
      setCategories(prev => [...prev, newCat]);
      toast.success('Category created');
      reset();
      setShowForm(false);
    } catch {
      toast.error('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      await api.put(`/api/categories/${cat.id}`, { ...cat, isActive: !cat.isActive });
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c));
      toast.success('Category updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Categories ({categories.length})</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center space-x-2">
            <FiPlus size={16} /><span>Add Category</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="card mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">New Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input {...register('name', { required: 'Name is required' })} className="input" placeholder="e.g. Electronics" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input {...register('description')} className="input" placeholder="Brief description..." />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create Category'}</button>
            </div>
          </form>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className={`card flex items-center space-x-4 ${!cat.isActive ? 'opacity-60' : ''}`}>
                <div className="p-3 bg-primary-50 rounded-xl text-primary-500"><FiTag size={20} /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                  {cat.description && <p className="text-xs text-gray-500 truncate">{cat.description}</p>}
                  <p className="text-xs text-gray-400">{cat.adCount || 0} ads</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleActive(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${cat.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {cat.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
