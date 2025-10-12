'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register, loginWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace('/');
  }, [user, authLoading]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(email, password, name, 'user', phone);
      toast.success('Account created! Welcome 🎉');
      router.replace('/');
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already registered'
        : err.code === 'auth/weak-password' ? 'Password is too weak'
        : 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await loginWithGoogle(); router.replace('/'); }
    catch { toast.error('Google sign-up failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center font-bold text-white text-sm">LK</div>
            <span className="text-2xl font-extrabold text-primary-600">ikman<span className="text-gray-800">.lk</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Free to join. Post ads. Contact sellers directly.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <button onClick={handleGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50">
            <FcGoogle size={20} />Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder="Your full name" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="0771234567" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Min 6 characters" className="input pl-10 pr-10" minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              By registering, you agree to our{' '}
              <a href="#" className="text-primary-500 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50">
              {loading ? 'Creating account...' : <><span>Create Account</span><FiArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
