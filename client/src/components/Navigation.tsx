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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

    checkAuth();

    const handleRouteChange = () => {
      checkAuth();
      setMobileMenuOpen(false); // Route değişince mobil menüyü kapat
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (profileDropdownOpen || mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Anasayfa', icon: '/home.png', isEmoji: false },
    { href: '/focus', label: 'Ortam Seç', icon: '🎧', isEmoji: true },
    { href: '/timer', label: 'Zamanlayıcı', icon: '⏱', isEmoji: true },
    { href: '/discover', label: 'Keşfet', icon: '/kesfet.png', isEmoji: false },
    { href: '/books', label: 'Kitaplığım', icon: '/kitaplık.png', isEmoji: false },
    { href: '/stats', label: 'İstatistikler', icon: '/istatistik.png', isEmoji: false, requiresAuth: true },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const handleAuthNavigation = (e: React.MouseEvent, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
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
      <div className="flex items-center justify-between h-16 w-full max-w-7xl mx-auto">
        {/* Sol Taraf - Logo ve Başlık */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group z-50">
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

        {/* Orta Taraf - Desktop Navigation Links (sadece lg ve üzeri ekranlarda görünür) */}
        <div className="hidden lg:flex items-center justify-end flex-1 gap-2 mx-4 sm:mx-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleAuthNavigation(e, link.requiresAuth)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                router.pathname === link.href
                  ? 'text-[#ffb347] bg-dark-bg-primary/50'
                  : 'text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30'
              }`}
            >
              {link.isEmoji ? (
                <span className="text-lg">{link.icon}</span>
              ) : (
                <div className="relative w-5 h-5">
                  <Image
                    src={link.icon}
                    alt={link.label}
                    width={20}
                    height={20}
                    className="w-full h-full object-contain brightness-0 invert opacity-90 contrast-200"
                    style={{
                      mixBlendMode: 'screen',
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                </div>
              )}
              <span className="text-sm font-medium whitespace-nowrap">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Sağ Taraf - Profil ve Mobil Hamburger */}
        <div className="flex items-center gap-2 sm:gap-4 z-50">
          {isAuthenticated && user ? (
            <div className="relative hidden lg:block" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-dark-bg-primary/30 transition-all group"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-warm-beige/30 group-hover:border-[#ffb347] transition-colors">
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
                {/* Masaüstünde (lg) ismi göster */}
                <span className="text-text-light text-sm font-medium group-hover:text-[#ffb347] transition-colors">
                  {user.name}
                </span>
                <svg
                  className={`w-4 h-4 text-text-medium transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Desktop Profile Dropdown (lg ve üzeri) */}
              {profileDropdownOpen && (
                <div className="hidden lg:block absolute right-0 mt-2 w-56 bg-dark-bg-secondary border border-warm-beige/20 rounded-2xl shadow-soft-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-warm-beige/10">
                    <p className="text-sm font-semibold text-warm-beige font-serif">{user.name}</p>
                    <p className="text-xs text-text-medium mt-1">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 transition-all ${
                        router.pathname === '/settings'
                          ? 'text-[#ffb347] bg-dark-bg-primary/50'
                          : 'text-text-light hover:bg-dark-bg-primary/50 hover:text-[#ffb347]'
                      }`}
                    >
                      <span className="text-sm">Ayarlar</span>
                    </Link>
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
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-text-light hover:text-[#ffb347] hover:bg-dark-bg-primary/30 transition-all text-sm font-medium whitespace-nowrap"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-warm-beige hover:bg-warm-light text-dark-bg-primary transition-all text-sm font-medium shadow-soft whitespace-nowrap"
              >
                Kayıt Ol
              </Link>
            </div>
          )}

          {/* Mobil Menü İkonu (Hamburger) - Sadece lg altı ekranlarda (Tablet ve Telefon) */}
          <div className="lg:hidden flex items-center" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-warm-beige hover:text-warm-light transition-colors flex items-center justify-center p-2 rounded-xl hover:bg-dark-bg-primary/30"
              aria-label="Menüyü Aç/Kapat"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
              <div className="absolute top-[65px] right-2 w-[240px] bg-dark-bg-secondary border border-warm-beige/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden z-50">
                {isAuthenticated && user && (
                  <div className="px-4 py-4 border-b border-warm-beige/20 bg-dark-bg-primary/50">
                    <p className="text-sm font-semibold text-warm-beige font-serif">{user.name}</p>
                    <p className="text-xs text-text-medium mt-1 truncate">{user.email}</p>
                  </div>
                )}
                
                <div className="py-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleAuthNavigation(e, link.requiresAuth)}
                      className={`flex items-center gap-3 px-5 py-3 transition-all ${
                        router.pathname === link.href
                          ? 'text-[#ffb347] bg-dark-bg-primary/50 border-l-2 border-[#ffb347]'
                          : 'text-text-light hover:bg-dark-bg-primary/30 hover:text-[#ffb347] border-l-2 border-transparent'
                      }`}
                    >
                      {link.isEmoji ? (
                        <span className="text-lg w-5 text-center">{link.icon}</span>
                      ) : (
                        <div className="relative w-5 h-5 opacity-90">
                          <Image
                            src={link.icon}
                            alt={link.label}
                            width={20}
                            height={20}
                            className={`w-full h-full object-contain brightness-0 invert contrast-200 ${router.pathname === link.href ? '' : 'opacity-80'}`}
                            style={{
                              mixBlendMode: 'screen',
                              filter: 'brightness(0) invert(1)',
                            }}
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {!isAuthenticated ? (
                  <div className="border-t border-warm-beige/20 py-2 px-3 flex flex-col gap-2 bg-dark-bg-primary/30">
                    <Link
                      href="/login"
                      className="w-full px-4 py-2 text-center rounded-xl text-text-light hover:bg-dark-bg-primary/50 transition-all text-sm font-medium"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/register"
                      className="w-full px-4 py-2 text-center rounded-xl bg-warm-beige hover:bg-warm-light text-dark-bg-primary transition-all text-sm font-medium shadow-soft"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                ) : (
                  <div className="border-t border-warm-beige/20 py-1 bg-dark-bg-primary/30">
                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-text-light hover:bg-dark-bg-primary/50 hover:text-[#ffb347] transition-all border-b border-warm-beige/10"
                    >
                      <div className="relative w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Ayarlar</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all text-sm font-medium"
                    >
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
