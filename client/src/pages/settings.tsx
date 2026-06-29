import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import apiClient from '../lib/api';
import { useAppStore } from '../lib/store';

// Göz ikonu SVG bileşenleri
const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Form validation
    if (newPassword && newPassword !== confirmPassword) {
      setError('Yeni şifreler eşleşmiyor. Lütfen iki alana da aynı şifreyi girdiğinizden emin olun.');
      return;
    }

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
      setConfirmPassword('');

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
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition pr-12"
                      placeholder="Sadece şifre değiştirecekseniz girin"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-medium hover:text-warm-beige transition-colors"
                    >
                      {showCurrentPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">Yeni Şifreniz</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition pr-12"
                      placeholder="Yeni şifrenizi girin"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-medium hover:text-warm-beige transition-colors"
                    >
                      {showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">Yeni Şifreniz (Tekrar)</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition pr-12"
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-medium hover:text-warm-beige transition-colors"
                    >
                      {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
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
