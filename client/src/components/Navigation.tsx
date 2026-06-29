import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAppStore } from '../lib/store';

export const Navigation: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // LocalStorage'dan token'ı yükle ve router değişikliklerini dinle
  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        useAppStore.setState({
          isAuthenticated: true,
          token,
          user: JSON.parse(storedUser),
        });
      } else {
        useAppStore.setState({
          isAuthenticated: false,
          token: null,
          user: null,
        });
      }
    };

    // İlk yüklemede kontrol et
    checkAuth();

    // Router değişikliklerini dinle
    const handleRouteChange = () => {
      checkAuth();
    };

    router.events?.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const profileMenuItems = [
    { href: '/focus', label: 'Ortam Seç' },
    { href: '/timer', label: 'Zamanlayıcı' },
    { href: '/discover', label: 'Keşfet' },
    { href: '/books', label: 'Kitaplığım' },
    { href: '/stats', label: 'İstatistikler' },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfileDropdownOpen(false);
    router.push('/');
  };

  const handleAuthNavigation = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login');
    }
  };

  if (!mounted) return null;

  return (
    <nav
      className="glass border-b border-warm-beige/10 sticky top-0 z-50 px-3 sm:px-4"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      <div className="flex items-center justify-between h-16 w-full">
        {/* Sol Taraf - Logo ve Başlık */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Okuma Köşesi Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain brightness-0 invert opacity-90 contrast-200"
              style={{
                mixBlendMode: 'screen',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
          <span className="text-base sm:text-xl font-serif font-semibold text-white group-hover:text-warm-light transition-colors whitespace-nowrap">
            Okuma Köşesi
          </span>
        </Link>

        {/* Sağ Taraf - Navigation ve Auth */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Anasayfa Linki */}
          <Link
            href="/"
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${router.pathname === '/'
              ? 'text-[#ffb347] bg-dark-bg-primary/50'
              : 'text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30'
              }`}
          >
            <div className="relative w-5 h-5">
              <Image
                src="/home.png"
                alt="Anasayfa"
                width={20}
                height={20}
                className="w-full h-full object-contain brightness-0 invert opacity-90 contrast-200"
                style={{
                  mixBlendMode: 'screen',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
            <span className="text-sm font-medium">Anasayfa</span>
          </Link>

          {/* Ortam Seçme Butonu */}
          <Link
            href="/focus"
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${router.pathname === '/focus'
              ? 'text-[#ffb347] bg-dark-bg-primary/50'
              : 'text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30'
              }`}
          >
            <span className="text-lg">🎧</span>
            <span className="text-sm font-medium">Ortam Seç</span>
          </Link>

          {/* Zamanlayıcı Butonu */}
          <Link
            href="/timer"
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${router.pathname === '/timer'
              ? 'text-[#ffb347] bg-dark-bg-primary/50'
              : 'text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30'
              }`}
          >
            <span className="text-lg">⏱</span>
            <span className="text-sm font-medium">Zamanlayıcı</span>
          </Link>

          {/* Keşfet Butonu */}
          <Link
            href="/discover"
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${router.pathname === '/discover'
              ? 'text-[#ffb347] bg-dark-bg-primary/50'
              : 'text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30'
              }`}
          >
            <div className="relative w-5 h-5">
              <Image
                src="/kesfet.png"
                alt="Keşfet"
                width={20}
                height={20}
                className="w-full h-full object-contain brightness-0 invert opacity-90 contrast-200"
                style={{
                  mixBlendMode: 'screen',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
            <span className="text-sm font-medium">Keşfet</span>
          </Link>

          {/* Kitaplığım Linki */}
          <Link
            href="/books"
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${router.pathname === '/books'
              ? 'text-[#ffb347] bg-dark-bg-primary/50'
              : 'text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30'
              }`}
          >
            <div className="relative w-5 h-5">
              <Image
                src="/kitaplık.png"
                alt="Kitaplığım"
                width={20}
                height={20}
                className="w-full h-full object-contain brightness-0 invert opacity-90 contrast-200"
                style={{
                  mixBlendMode: 'screen',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
            <span className="text-sm font-medium">Kitaplığım</span>
          </Link>

          {/* İstatistikler Linki */}
          <Link
            href="/stats"
            onClick={handleAuthNavigation}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${router.pathname === '/stats'
              ? 'text-[#ffb347] bg-dark-bg-primary/50'
              : 'text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30'
              }`}
          >
            <div className="relative w-5 h-5">
              <Image
                src="/istatistik.png"
                alt="İstatistikler"
                width={20}
                height={20}
                className="w-full h-full object-contain brightness-0 invert opacity-90 contrast-200"
                style={{
                  mixBlendMode: 'screen',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
            <span className="text-sm font-medium">İstatistikler</span>
          </Link>

          {isAuthenticated && user ? (
            <>
              {/* Profil Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark-bg-primary/30 transition-all group"
                >
                  {/* Desktop: Profil Fotoğrafı */}
                  <div className="relative hidden sm:block w-8 h-8 rounded-full overflow-hidden border-2 border-warm-beige/30 group-hover:border-[#ffb347] transition-colors">
                    <Image
                      src="/profile.png"
                      alt="Profil"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain brightness-0 invert opacity-90 contrast-200"
                      style={{
                        mixBlendMode: 'screen',
                        filter: 'brightness(0) invert(1)',
                      }}
                    />
                  </div>
                  
                  {/* Desktop: İsim ve Ok */}
                  <span className="hidden sm:block text-text-light text-sm font-medium group-hover:text-[#ffb347] transition-colors">
                    {user.name}
                  </span>
                  <svg
                    className={`hidden sm:block w-4 h-4 text-text-medium transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>

                  {/* Mobile: Hamburger Menu İkonu */}
                  <div className="sm:hidden text-warm-beige group-hover:text-warm-light transition-colors flex items-center justify-center p-1">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {profileDropdownOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      )}
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass border border-warm-beige/10 rounded-2xl shadow-soft-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-warm-beige/10">
                      <p className="text-sm font-semibold text-warm-beige font-serif">{user.name}</p>
                      <p className="text-xs text-text-medium mt-1">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setProfileDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 transition-all ${router.pathname === item.href
                            ? 'text-[#ffb347] bg-dark-bg-primary/50'
                            : 'text-text-light hover:bg-dark-bg-primary/50 hover:text-[#ffb347]'
                            }`}
                        >
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-warm-beige/10 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-text-light hover:bg-red-600/20 hover:text-red-400 transition-all text-sm"
                      >
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Giriş Yapılmamışsa */}
              <Link
                href="/login"
                className="px-2 sm:px-4 py-2 rounded-xl text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30 transition-all text-sm font-medium whitespace-nowrap"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-3 sm:px-4 py-2 rounded-xl bg-warm-beige hover:bg-warm-light text-dark-bg-primary transition-all text-sm font-medium shadow-soft whitespace-nowrap"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
