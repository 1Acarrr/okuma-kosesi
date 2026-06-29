import React from 'react';
import Head from 'next/head';

export default function About() {
  return (
    <div className="min-h-screen bg-dark-bg-primary text-text-light py-20 px-4">
      <Head>
        <title>Hakkında | Okuma Köşesi</title>
      </Head>
      <div className="max-w-4xl mx-auto glass p-8 md:p-12 rounded-3xl border border-warm-beige/10">
        <h1 className="text-3xl md:text-4xl font-serif text-warm-beige mb-8">Okuma Köşesi Hakkında</h1>
        <div className="space-y-6 text-sm md:text-base text-text-medium leading-relaxed font-sans">
          <p>
            Okuma Köşesi, kitap okuma alışkanlığınızı derinleştirmek ve dijital çağın getirdiği dikkat dağınıklıklarından uzaklaşarak odaklanmanızı sağlamak amacıyla kurulmuş yenilikçi bir çalışma alanıdır.
          </p>
          <p>
            Geliştirdiğimiz araçlar sayesinde sadece kitap okumakla kalmaz, aynı zamanda okuma istatistiklerinizi analiz eder, hedefler belirler ve kendinizi geliştirirsiniz. Doğanın huzur veren sesleri ve loş tasarım eşliğinde kendinize özel bir dijital sığınak yaratabilirsiniz.
          </p>
          <p>
            Kitapların dönüştürücü gücüne inanan bir ekibiz. Amacımız, modern dünyanın karmaşasında kaybolmadan, kelimelerle aranızda sarsılmaz bir bağ kurmanıza yardımcı olmaktır.
          </p>
          <div className="mt-8 pt-8 border-t border-warm-beige/10">
            <h2 className="text-xl font-serif text-warm-light mb-4">Vizyonumuz</h2>
            <p>
              Gelecekte, tüm kitapseverlerin vazgeçilmez dijital sığınağı ve performans asistanı olmayı hedefliyoruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
