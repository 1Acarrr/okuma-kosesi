import type { AppProps } from 'next/app';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import '../styles/globals.css';
import React, { useEffect, useState } from 'react';

function AppWrapper({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
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
