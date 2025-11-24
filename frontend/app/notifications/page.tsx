'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiBell, FiCheckCircle, FiPackage, FiStar, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/types';

const TYPE_ICONS: Record<string, any> = {
  order: FiPackage,
  review: FiStar,
  system: FiAlertCircle,
  promotion: FiBell,
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    api.get('/api/notifications').then(r => setNotifications(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading]);

  const markRead = async (id: string) => {
    await api.patch(`/api/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.patch('/api/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-gray-500">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center space-x-1">
              <FiCheckCircle size={14} /><span>Mark all read</span>
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FiBell size={56} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const Icon = TYPE_ICONS[n.type] || FiBell;
              return (
                <div key={n.id} onClick={() => !n.isRead && markRead(n.id)}
                  className={`card cursor-pointer transition-all hover:shadow-md ${!n.isRead ? 'border-l-4 border-primary-400 bg-primary-50/30' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${n.isRead ? 'bg-gray-100 text-gray-400' : 'bg-primary-100 text-primary-600'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${n.isRead ? 'text-gray-600' : 'text-gray-800'}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
