'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiUserCheck, FiUserX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';

export default function AdminUsersPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') { router.push('/'); return; }
    api.get('/api/users').then(r => setUsers(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user, profile, authLoading]);

  const toggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.patch(`/api/users/${userId}/status`, { isActive: !isActive });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const filtered = users.filter(u =>
    (search === '' || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === '' || u.role === roleFilter)
  );

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    seller: 'bg-blue-100 text-blue-700',
    buyer: 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Users ({users.length})</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" placeholder="Search users..." />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-40">
            <option value="">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => (
                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm flex-shrink-0">
                            {u.displayName?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{u.displayName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.role !== 'admin' && (
                          <button onClick={() => toggleStatus(u.uid, u.isActive)}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {u.isActive ? <><FiUserX size={12} /><span>Deactivate</span></> : <><FiUserCheck size={12} /><span>Activate</span></>}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
