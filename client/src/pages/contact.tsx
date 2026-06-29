import React from 'react';
import Head from 'next/head';

export default function Contact() {
  return (
    <div className="min-h-screen bg-dark-bg-primary text-text-light py-20 px-4">
      <Head>
        <title>İletişim | Okuma Köşesi</title>
      </Head>
      <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-3xl border border-warm-beige/10">
        <h1 className="text-3xl md:text-4xl font-serif text-warm-beige mb-8">Bizimle İletişime Geçin</h1>
        <div className="space-y-6 text-sm md:text-base text-text-medium leading-relaxed font-sans mb-12">
          <p>
            Okuma Köşesi deneyiminizi geliştirmek için görüşleriniz bizim için çok değerli. Bir sorun bildirmek, yeni bir özellik önermek veya sadece merhaba demek için bize ulaşabilirsiniz.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <span className="text-2xl">📧</span>
            <a href="mailto:acarisa855@gmail.com" className="text-warm-beige hover:text-warm-light transition-colors text-lg font-medium">
              acarisa855@gmail.com
            </a>
          </div>
        </div>

        <form className="space-y-6" action="mailto:acarisa855@gmail.com" method="GET">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-warm-beige">İsim</label>
              <input type="text" id="name" className="w-full bg-dark-bg-primary/50 border border-warm-beige/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-beige/60 transition-colors" placeholder="Adınız" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-warm-beige">E-posta</label>
              <input type="email" id="email" className="w-full bg-dark-bg-primary/50 border border-warm-beige/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-beige/60 transition-colors" placeholder="E-posta adresiniz" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-warm-beige">Mesaj</label>
            <textarea id="message" name="body" rows={5} className="w-full bg-dark-bg-primary/50 border border-warm-beige/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-warm-beige/60 transition-colors resize-none" placeholder="Mesajınız..."></textarea>
          </div>
          <button type="submit" className="bg-warm-beige hover:bg-warm-light text-dark-bg-primary px-8 py-3 rounded-xl font-medium transition-all shadow-soft">
            E-posta Gönder
          </button>
        </form>
      </div>
    </div>
  );
}
