import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import apiClient from '../lib/api';
import { useAppStore } from '../lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAppStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      const { token, user } = response.data;

      // LocalStorage'a kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Store'u güncelle
      setAuth(true, user, token);

      // Anasayfaya yönlendir
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message ||
        'Kayıt başarısız oldu';
      setError(errorMessage);
      console.error('Registration error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8 bg-dark-bg-primary">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-serif font-bold text-warm-beige">Okuma Köşesi</h1>
          <p className="text-text-medium">Yeni hesapla aramıza katıl.</p>
        </div>

        {/* Register Form */}
        <div className="glass border border-warm-beige/10 rounded-2xl p-8 shadow-soft-lg">
          <h2 className="text-2xl font-serif font-semibold text-warm-beige mb-6">Kayıt Ol</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                placeholder="Adınız Soyadınız"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-4 pr-12 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-medium hover:text-text-light transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                Şifre Onayla
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-4 pr-12 py-3 bg-dark-bg-secondary border border-dark-bg-darker/60 rounded-xl text-text-light placeholder-text-medium focus:outline-none focus:border-warm-beige focus:ring-2 focus:ring-warm-beige/40 transition"
                  placeholder=""
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-medium hover:text-text-light transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-warm-beige text-dark-bg-primary font-semibold shadow-soft hover:bg-warm-light disabled:opacity-60 transition"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-medium">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="text-warm-beige hover:text-warm-light underline decoration-warm-beige/50">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}