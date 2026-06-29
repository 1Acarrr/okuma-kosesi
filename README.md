# Okuma Köşesi - README

<div align="center">

![Okuma Köşesi](📖)

# Okuma Köşesi
**Odaklanarak Okumak İçin Web Platformu**

[Features](#-özellikler) • [Kurulum](#-kurulum) • [Geliştirme](#-geliştirme) • [Katkı](#-katkı)

</div>

---

## 📚 Proje Hakkında

**Okuma Köşesi**, kitap okuyanlara telifsiz ortam sesleri, sade görseller ve zamanlayıcı ile odaklanmayı artırmayı amaçlayan bir web platformudur.

Aynı zamanda okuma sürelerinizi, okuduğunuz kitapları ve aldığınız notları takip edebilmenizi sağlar.

### 🎯 Misyon
- Kesintisiz ve odaklanmış okuma deneyimi sunmak
- Okuma alışkanlıklarını teşvik etmek
- Telifsiz ve açık kaynak teknolojiler kullanmak

---

## ✨ Özellikler

- 🎯 **Odak Modu**: 25 dakikalık Pomodoro timer ve ortam sesleri
- 🎵 **Telifsiz Ortam Sesleri**: Yağmur, ateş, doğa, şehir, kahve dükkanı
- 📚 **Kitap Takibi**: Kitap ekle, okuma ilerlemesini izle
- 📝 **Not Alma**: Kitaplara bağlı notlar, alıntılar ve highlights
- 📊 **İstatistikler**: Günlük/haftalık okuma süreleri, oturum sayısı
- 📱 **Mobile-First Design**: Tüm cihazlarda optimize edilmiş
- 🌙 **Karanlık Tema**: Gözleri koruyan minimal tasarım
- ✅ **Telifsiz & Açık Kaynak**: Reklamsız, izlemesiz, kişisel veri toplamayan

---

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js** 14 - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Firebase** - Database & Authentication
- **TypeScript** - Type safety

### Database
- **Firestore** - Cloud database

---

## 📦 Kurulum

### Ön Koşullar
```bash
- Node.js v18+
- npm 9+
- Git
```

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/yourusername/okuma-kosesi.git
cd okuma-kosesi
```

### 2. Backend Kurulumu

```bash
cd server

# Paketleri yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# .env dosyasına Firebase bilgilerini ekle
# FIREBASE_PROJECT_ID=...
# FIREBASE_PRIVATE_KEY=...
# FIREBASE_CLIENT_EMAIL=...

# Geliştirme modunda çalıştır
npm run dev

# Server http://localhost:5000 adresinde çalışacak
```

### 3. Frontend Kurulumu (Yeni Terminal)

```bash
cd client

# Paketleri yükle
npm install

# Environment dosyasını oluştur
cp .env.local.example .env.local

# Geliştirme modunda çalıştır
npm run dev

# Browser'da http://localhost:3000 adresini açın
```

---

## 📖 Kullanım

### Odak Modu
1. "🎯 Odak Modu" sayfasına git
2. Ortam sesini seç
3. Zamanlayıcıyı ayarla (15, 25, 45, 60 dakika)
4. "Başlat" butonuna tıkla
5. Kitabını oku

### Kitap Ekleme
1. "📚 Kitaplar" sayfasına git
2. "➕ Kitap Ekle" butonuna tıkla
3. Kitap bilgilerini doldur
4. "Kaydet"

### Not Ekleme
1. Kitapdan "Aç" butonuna tıkla
2. Not ekle formunu doldur
3. Sayfa numarası ve alıntı (opsiyonel)
4. "Kaydet"

### İstatistikleri Görme
1. "📊 İstatistikler" sayfasına git
2. Özet istatistikleri, günlük ve haftalık rakamlara bak

---

## 📁 Proje Yapısı

```
okuma-kosesi/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # İş mantığı
│   │   ├── routes/        # API rotaları
│   │   ├── services/      # Database işlemleri
│   │   ├── middlewares/   # Express middlewares
│   │   ├── config/        # Konfigürasyon
│   │   └── index.ts       # Ana dosya
│   └── package.json
│
└── client/                 # Frontend (Next.js + React)
    ├── src/
    │   ├── pages/         # Sayfalar
    │   ├── components/    # React bileşenleri
    │   ├── hooks/         # Custom hooks
    │   ├── lib/           # Yardımcı fonksiyonlar
    │   ├── types/         # TypeScript tipler
    │   └── styles/        # Global stiller
    └── package.json
```

Detaylı proje mimarisi için [ARCHITECTURE.md](./ARCHITECTURE.md) dosyasına bakın.

---

## 🚀 Geliştirme

### Backend Modunu Çalıştırma

```bash
cd server
npm run dev     # Development
npm run build   # Production build
npm start       # Production çalıştırma
npm run lint    # Code lint
```

### Frontend Modunu Çalıştırma

```bash
cd client
npm run dev     # Development
npm run build   # Production build
npm start       # Production çalıştırma
npm run lint    # Code lint
```

### API Endpoint'leri

```bash
# Kitaplar
GET     /api/v1/books              # Tüm kitapları getir
POST    /api/v1/books              # Kitap ekle
PUT     /api/v1/books/:id          # Kitabı güncelle
DELETE  /api/v1/books/:id          # Kitabı sil

# Notlar
GET     /api/v1/books/:id/notes    # Kitap notlarını getir
POST    /api/v1/books/:id/notes    # Not ekle
PUT     /api/v1/books/:id/notes/:noteId
DELETE  /api/v1/books/:id/notes/:noteId

# İstatistikler
GET     /api/v1/stats/daily        # Günlük stats
GET     /api/v1/stats/weekly       # Haftalık stats
GET     /api/v1/stats/summary      # Özet

# Sesler
GET     /api/v1/sounds             # Sesleri getir
```

Detaylı API dokümantasyonu için [DEVELOPMENT.md](./DEVELOPMENT.md) dosyasına bakın.

---

## 🔐 Güvenlik

- ✅ CORS koruması
- ✅ JWT authentication
- ✅ Environment variables
- ✅ Input validation
- ✅ Error handling
- ✅ Firebase Security Rules

---

## 📄 Lisans & Telifler

### Yazılım Lisansı
MIT License - Lütfen LICENSE dosyasına bakın

### İçerik Lisansları
- **Ses Dosyaları**: CC0-1.0 (Public Domain)
- **Görseller**: Unsplash, Pexels (Free)
- **Yazılım**: Açık Kaynak (MIT, Apache 2.0 vb.)

Detaylı telifler için [Credits Sayfasını](./credits.md) ziyaret edin.

---

## 🤝 Katkı

Katkılarınız çok değerlidir!

1. **Fork** yapın
2. **Feature Branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** yapın (`git commit -m 'Add amazing feature'`)
4. **Push** yapın (`git push origin feature/amazing-feature`)
5. **Pull Request** açın

### Kod Standartları
- TypeScript kullanın
- ESLint rules'a uyun
- Komponenlere TypeScript tip tanımları ekleyin
- Meaningful commit messages yazın

---

## 🐛 Sorun Bildirme

Eğer bir bug bulduysanız, [Issues](https://github.com/yourusername/okuma-kosesi/issues) bölümünde yeni bir issue açın.

Lütfen şunları ekleyin:
- Bug açıklaması
- Tekrar etme adımları
- Beklenen davranış
- Gerçek davranış
- Screenshots (gerekirse)

---

## 📱 React Native Mobile App

Bu proje **React Native**'e kolayca dönüştürülebilir:

```bash
npx create-expo-app okuma-kosesi-mobile

# Backend ve API client aynı kalır
# Yalnızca UI bileşenleri değiştirilir
```

---

## 📚 Öğrenme Kaynakları

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 🎯 Roadmap

- [ ] Firebase Authentication entegrasyonu
- [ ] Advanced charts & statistics
- [ ] Offline mode (Service Workers)
- [ ] Kitap önerileri (AI)
- [ ] Sosyal özellikler (sharing, leaderboards)
- [ ] Premium features
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Multilingual support (10+ dil)

---

## 📞 İletişim

- **GitHub Issues**: Teknik sorular ve bug raporları
- **Discussions**: Fikirler ve öneriler

---

## ⭐ Destek

Bu projeyi yararlı bulduysanız, lütfen bir yıldız verin ⭐

---

<div align="center">

**❤️ Okuma Köşesi ile mutlu okumalar dileriz!**

Made with ❤️ for readers, by readers

**[🔝 Başa Dön](#-okuma-köşesi)**

</div>
