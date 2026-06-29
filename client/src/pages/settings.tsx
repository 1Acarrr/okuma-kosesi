import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import apiClient from '../lib/api';
import { useAppStore } from '../lib/store';

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && mounted) {
      router.push('/login');
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiClient.put('/auth/profile', {
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      const { token, user: updatedUser, message } = response.data;

      // Update LocalStorage
      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update Store
      setAuth(true, updatedUser, token || localStorage.getItem('token') || '');

      setSuccess(message || 'Profiliniz başarıyla güncellendi.');
      setCurrentPassword('');
      setNewPassword('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.details ||
        'Güncelleme sırasında bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>Ayarlar | Okuma Köşesi</title>
      </Head>
      <main className="w-full flex-1 bg-dark-bg-primary px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-warm-beige">
            Ayarlar
          </h2>
          <p className="text-text-medium mb-10 uppercase tracking-[0.3em] text-[10px] font-light">
            PROFİL BİLGİLERİNİZİ VE ŞİFRENİZİ GÜNCELLEYİN
          </p>

          <div className="glass border border-warm-beige/10 rounded-2xl p-6 md:p-8 shadow-soft-lg">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Information Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-semibold text-warm-light border-b border-warm-beige/10 pb-2 mb-4">Profil Bilgileri</h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">E-posta Adresi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                    required
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4 pt-6 mt-6 border-t border-warm-beige/10">
                <h3 className="text-xl font-serif font-semibold text-warm-light border-b border-warm-beige/10 pb-2 mb-4">Şifre Değiştirme <span className="text-xs text-text-medium font-sans font-normal ml-2">(İsteğe bağlı)</span></h3>
                
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">Mevcut Şifreniz</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                    placeholder="Sadece şifre değiştirecekseniz girin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">Yeni Şifreniz</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                    placeholder="Sadece şifre değiştirecekseniz girin"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-warm-beige text-dark-bg-primary font-semibold shadow-soft hover:bg-warm-light disabled:opacity-60 transition"
                >
                  {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
