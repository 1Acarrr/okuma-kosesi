import React from 'react';
import Head from 'next/head';

export default function Terms() {
  return (
    <div className="min-h-screen bg-dark-bg-primary text-text-light py-20 px-4">
      <Head>
        <title>Kullanım Şartları | Okuma Köşesi</title>
      </Head>
      <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-3xl border border-warm-beige/10">
        <h1 className="text-3xl md:text-4xl font-serif text-warm-beige mb-8">Kullanım Şartları</h1>
        <div className="space-y-6 text-sm md:text-base text-text-medium leading-relaxed font-sans">
          <p>Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          <p>Lütfen Okuma Köşesi platformunu kullanmadan önce aşağıdaki Kullanım Şartları'nı dikkatlice okuyunuz. Sitemize erişerek ve hizmetlerimizi kullanarak bu şartları kabul etmiş sayılırsınız.</p>
          
          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">1. Hizmetin Kullanımı</h2>
          <p>Okuma Köşesi, kullanıcılara kişisel okuma istatistiklerini takip etme ve odaklanma araçları sunar. Platformu yalnızca yasal amaçlar doğrultusunda ve bu şartlara uygun olarak kullanmayı kabul ediyorsunuz.</p>
          
          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">2. Hesap Güvenliği</h2>
          <p>Hesabınızın güvenliğinden tamamen siz sorumlusunuz. Şifrenizin gizliliğini korumak ve hesabınız üzerinden gerçekleşen her türlü aktivitenin sorumluluğunu üstlenmek size aittir.</p>

          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">3. Fikri Mülkiyet</h2>
          <p>Platformda bulunan tasarım, logolar, metinler, grafikler ve yazılım, Okuma Köşesi'nin veya içerik sağlayıcılarının mülkiyetindedir ve telif hakkı yasalarıyla korunmaktadır.</p>

          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">4. Hizmet Değişiklikleri</h2>
          <p>Okuma Köşesi, önceden haber vermeksizin platformun herhangi bir özelliğini değiştirme, duraklatma veya tamamen sonlandırma hakkını saklı tutar.</p>

          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">5. Sorumluluk Reddi</h2>
          <p>Hizmetlerimiz "olduğu gibi" ve "mevcut olduğu şekilde" sağlanmaktadır. Platformun kesintisiz, hatasız veya güvenli olacağına dair herhangi bir garanti vermiyoruz.</p>
        </div>
      </div>
    </div>
  );
}
