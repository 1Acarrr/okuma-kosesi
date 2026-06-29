import React from 'react';
import Head from 'next/head';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-dark-bg-primary text-text-light py-20 px-4">
      <Head>
        <title>Gizlilik Politikası | Okuma Köşesi</title>
      </Head>
      <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-3xl border border-warm-beige/10">
        <h1 className="text-3xl md:text-4xl font-serif text-warm-beige mb-8">Gizlilik Politikası</h1>
        <div className="space-y-6 text-sm md:text-base text-text-medium leading-relaxed font-sans">
          <p>Son güncellenme tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          <p>Okuma Köşesi olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Bu gizlilik politikası, sitemizi kullanırken topladığımız bilgileri ve bunları nasıl kullandığımızı açıklamaktadır.</p>
          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">1. Toplanan Bilgiler</h2>
          <p>Kayıt esnasında sağladığınız e-posta adresi, kullanıcı adı ve okuma alışkanlıklarınıza dair (odaklanma süresi, okunan kitaplar vb.) veriler sistemimizde güvenle saklanmaktadır.</p>
          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">2. Verilerin Kullanımı</h2>
          <p>Topladığımız veriler, size okuma istatistiklerinizi sunmak, kişisel hedeflerinizi takip etmenizi sağlamak ve platform deneyiminizi iyileştirmek amacıyla kullanılmaktadır. Verileriniz kesinlikle üçüncü şahıslarla reklam veya pazarlama amacıyla paylaşılmaz.</p>
          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">3. Çerezler (Cookies)</h2>
          <p>Oturumunuzu açık tutmak ve site performansını optimize etmek amacıyla temel düzeyde çerezler kullanılmaktadır.</p>
          <h2 className="text-xl font-serif text-warm-light mt-8 mb-4">4. İletişim</h2>
          <p>Gizlilik politikamız ile ilgili her türlü soru ve görüşünüz için <a href="mailto:merhaba@okumakosesi.com" className="text-warm-beige hover:underline">merhaba@okumakosesi.com</a> adresi üzerinden bizimle iletişime geçebilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}
