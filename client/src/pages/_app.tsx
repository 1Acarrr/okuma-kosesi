import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import '../styles/globals.css';
import React, { useEffect, useState } from 'react';

function AppWrapper({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Okuma Köşesi: Dijital kitaplığınızı oluşturun, okuma alışkanlıklarınızı takip edin, odaklanma sayacıyla verimli okuyun ve yeni kitaplar keşfedin." />
        <meta name="keywords" content="kitap, okuma köşesi, dijital kütüphane, okuma takibi, kitap inceleme, pomodoro, odaklanma, okuma istatistikleri, kitap tavsiyeleri" />
        <meta name="author" content="Okuma Köşesi" />
        
        {/* Open Graph / Social Media */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Okuma Köşesi | Dijital Kitaplığınız ve Okuma Asistanınız" />
        <meta property="og:description" content="Kişisel dijital kütüphanenizi oluşturun. Kitaplarınızı kaydedin, notlar alın, okuma sürelerinizi ölçün ve istatistiklerinizi analiz edin." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:site_name" content="Okuma Köşesi" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Okuma Köşesi | Dijital Kitaplığınız" />
        <meta name="twitter:description" content="Kişisel dijital kütüphanenizi oluşturun ve okuma alışkanlıklarınızı geliştirin." />
        <meta name="twitter:image" content="/logo.png" />
      </Head>
      <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
    </>
  );
}

export default function App(props: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      style={{ 
        visibility: mounted ? 'visible' : 'hidden',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.2s ease-in',
        minHeight: '100vh', 
        backgroundColor: '#1a1a1a' 
      }}
    >
      <AppWrapper {...props} />
    </div>
  );
}
