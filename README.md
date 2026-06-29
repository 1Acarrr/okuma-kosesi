# 📚 Okuma Köşesi (Reading Corner)

Okuma Köşesi, kişisel dijital kütüphanenizi oluşturmanızı, kitaplarınızı kaydetmenizi, okuma sürelerinizi ölçmenizi ve istatistiklerinizi analiz etmenizi sağlayan şık ve modern bir web uygulamasıdır. İçerisindeki "Odaklanma" modülü ile yağmur, kafe, şömine gibi çeşitli ortam sesleri eşliğinde okuma yapabilirsiniz.

## 🌟 Özellikler

- **Dijital Kitaplık:** Kitaplarınızı, yazar, kapak görseli ve durumuyla birlikte (Okunacak, Okunuyor, Bitti) kaydedin.
- **Odaklanma Modu & Zamanlayıcı:** Pomodoro veya Serbest okuma modları. Arka planda ortam sesleri (Lo-Fi, Yağmur, Kafe vb.) dinleyebilme.
- **Notlar ve Alıntılar:** Okuduğunuz kitaplardan sevdiğiniz alıntıları veya kendi okuma notlarınızı kaydedin.
- **İstatistikler:** Hangi ay ne kadar okudunuz, günlük hedefinizin neresindesiniz? Tüm analizlerinizi grafiklerle görün.
- **Karanlık (Dark) Tema & Glassmorphism:** Göz yormayan şık tasarım.
- **Mobil Uyumlu:** Telefon ve tabletlerden kusursuz erişim.

## 🛠️ Teknolojiler

- **Frontend:** React, Next.js, TailwindCSS
- **Backend:** Node.js, Express, TypeScript
- **Veritabanı:** MongoDB (Mongoose)
- **Kimlik Doğrulama:** JWT (JSON Web Tokens)
- **Depolama:** Supabase (Medya/Ses dosyaları)

## 🚀 Kurulum (Lokal Ortam İçin)

Projeyi kendi bilgisayarınızda çalıştırmak isterseniz aşağıdaki adımları izleyebilirsiniz.

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/1Acarrr/okuma-kosesi.git
cd okuma-kosesi
```

### 2. Backend (Sunucu) Kurulumu
```bash
cd server
npm install
```
`server` klasörü içerisinde bir `.env` dosyası oluşturun:
```env
PORT=5001
MONGODB_URI=sizin_mongodb_baglanti_adresiniz
JWT_SECRET=gizli_anahtar_belirleyin
FRONTEND_URL=http://localhost:3000
```
Sunucuyu başlatın:
```bash
npm run dev
```

### 3. Frontend (İstemci) Kurulumu
Yeni bir terminal sekmesi açın:
```bash
cd client
npm install
```
`client` klasörü içerisinde bir `.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```
İstemciyi başlatın:
```bash
npm run dev
```

Uygulamanız `http://localhost:3000` adresinde çalışıyor olacaktır.

## 🤝 Katkıda Bulunma (Contributing)

Bu proje açık kaynaktır ve her türlü katkıya (hata düzeltmeleri, yeni özellikler, tasarım iyileştirmeleri) açıktır. 
Lütfen katkıda bulunmadan önce [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
