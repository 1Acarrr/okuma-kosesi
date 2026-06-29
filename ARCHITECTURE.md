# Okuma Köşesi - Proje Mimarisi

## 📋 Genel Bakış

Okuma Köşesi, full-stack bir web uygulaması olarak tasarlanmıştır ve iki ana bölümden oluşur:

- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Firebase

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                       │
│  Next.js | React | TypeScript | Tailwind | Mobile-First    │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST API
                   │ (Axios + JSON)
┌──────────────────▼──────────────────────────────────────────┐
│                    SERVER (Backend)                         │
│      Express.js | TypeScript | Firebase | REST API         │
└──────────────────┬──────────────────────────────────────────┘
                   │ Firestore
┌──────────────────▼──────────────────────────────────────────┐
│                   DATABASE                                  │
│          Firebase Firestore (NoSQL)                         │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Klasör Yapısı

```
okuma-kosesi/
│
├── server/                          # Backend
│   ├── src/
│   │   ├── index.ts                 # Ana server dosyası
│   │   ├── config/
│   │   │   └── firebase.ts          # Firebase konfigürasyonu
│   │   ├── controllers/             # İş mantığı (Business Logic)
│   │   │   ├── bookController.ts
│   │   │   ├── noteController.ts
│   │   │   ├── statsController.ts
│   │   │   └── soundController.ts
│   │   ├── routes/                  # API rotaları
│   │   │   ├── bookRoutes.ts
│   │   │   ├── noteRoutes.ts
│   │   │   ├── statsRoutes.ts
│   │   │   ├── soundRoutes.ts
│   │   │   └── authRoutes.ts
│   │   ├── services/                # Veri tabanı işlemleri
│   │   │   ├── bookService.ts
│   │   │   ├── noteService.ts
│   │   │   └── statsService.ts
│   │   └── middlewares/             # Express middlewares
│   │       └── authMiddleware.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── client/                          # Frontend
    ├── src/
    │   ├── pages/                   # Next.js sayfaları
    │   │   ├── index.tsx            # Ana sayfa
    │   │   ├── focus.tsx            # Odak modu
    │   │   ├── books.tsx            # Kitaplar sayfası
    │   │   ├── stats.tsx            # İstatistikler
    │   │   ├── credits.tsx          # Telifler
    │   │   ├── _app.tsx             # App wrapper
    │   │   └── _document.tsx        # HTML template
    │   ├── components/              # React bileşenleri
    │   │   ├── Navigation.tsx       # Navigasyon menüsü
    │   │   ├── FocusTimer.tsx       # Timer bileşeni
    │   │   ├── AmbientSoundPlayer.tsx
    │   │   ├── BookCard.tsx         # Kitap kartı
    │   │   ├── NoteList.tsx         # Not listesi
    │   │   └── StatsOverview.tsx    # İstatistik özeti
    │   ├── hooks/                   # Custom hooks
    │   │   ├── useTimer.ts          # Timer hook
    │   │   └── useAudioPlayer.ts    # Audio player hook
    │   ├── lib/                     # Yardımcı fonksiyonlar
    │   │   ├── api.ts              # API istemci (Axios)
    │   │   └── store.ts            # State management (Zustand)
    │   ├── types/                   # TypeScript tipler
    │   │   └── index.ts
    │   └── styles/
    │       └── globals.css          # Global stiller
    ├── public/                      # Statik dosyalar
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env.local.example
```

## 🔄 Veri Akışı

### API Mimarisi (REST)

```
Client (Frontend)
    │
    ├──> GET /api/v1/books              → Kitapları getir
    ├──> POST /api/v1/books             → Kitap ekle
    ├──> PUT /api/v1/books/:id          → Kitabı güncelle
    ├──> DELETE /api/v1/books/:id       → Kitabı sil
    ├──> POST /api/v1/books/:id/sessions → Okuma seansını kaydet
    │
    ├──> GET /api/v1/notes              → Notları getir
    ├──> POST /api/v1/notes             → Not ekle
    ├──> PUT /api/v1/notes/:id          → Notu güncelle
    ├──> DELETE /api/v1/notes/:id       → Notu sil
    │
    ├──> GET /api/v1/stats/daily        → Günlük istatistikler
    ├──> GET /api/v1/stats/weekly       → Haftalık istatistikler
    ├──> GET /api/v1/stats/summary      → Özet istatistikler
    │
    └──> GET /api/v1/sounds            → Ortam seslerini getir
```

## 🗄️ Firestore Veri Modeli

### Koleksiyonlar (Collections)

```
firestore
│
├── books/
│   └── {bookId}/
│       ├── id: string
│       ├── userId: string
│       ├── title: string
│       ├── author: string
│       ├── coverUrl?: string
│       ├── totalPages?: number
│       ├── currentPage?: number
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       │
│       └── sessions/ (subcollection)
│           └── {sessionId}/
│               ├── id: string
│               ├── durationMinutes: number
│               ├── pagesRead?: number
│               └── date: timestamp
│
├── notes/
│   └── {noteId}/
│       ├── id: string
│       ├── userId: string
│       ├── bookId: string
│       ├── content: string
│       ├── pageNumber?: number
│       ├── highlight?: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── users/
    └── {userId}/
        ├── email: string
        ├── name: string
        ├── createdAt: timestamp
        └── preferences: object
```

## 🔐 Kimlik Doğrulama (Authentication)

- **Firebase Authentication** kullanılmaktadır
- JWT token bazlı istek doğrulaması
- `authMiddleware` tüm protected rotaları kontrol eder

## 💾 State Management (Frontend)

**Zustand** kullanılarak merkezi state yönetimi yapılmıştır:

- `isAuthenticated`: Kullanıcı giriş durumu
- `books`: Kullanıcı kitapları
- `currentBook`: Seçili kitap
- `notes`: Notlar
- `currentSound`: Seçili ses
- `isFocusMode`: Odak modu durumu
- `timerMinutes`, `isTimerRunning`: Timer durumu

## 🎨 UI/UX Özellikleri

- **Mobile-First Design**: Mobil cihazlarda öncelik
- **Dark Theme**: Akşam okuyucuları için gözleri koruyucu koyu tema
- **Minimal Design**: Dikkat dağıtıcı öğeler minimumda
- **Responsive**: Tüm cihazlarda optimize edilmiş

## 🚀 Dağıtım Mimarisi (Deployment)

### Frontend Dağıtımı
- Vercel, Netlify veya GitHub Pages
- Next.js'in static export özelliği ile deploy edilebilir

### Backend Dağıtımı
- Heroku, Railway, Render gibi Node.js hosting servisleri
- Docker containerization desteği eklenebilir

## 🔐 Güvenlik Özellikleri

- ✅ CORS konfigürasyonu
- ✅ Environment variables (.env)
- ✅ JWT token doğrulaması
- ✅ Firebase Security Rules
- ✅ Input validation (Joi)
- ✅ Error handling

## 📦 Paket Bağımlılıkları

### Backend
- express: Web framework
- firebase-admin: Database ve auth
- cors: CORS support
- dotenv: Environment variables
- joi: Validation
- uuid: Unique ID generation
- typescript: Type safety

### Frontend
- next: React framework
- react: UI library
- typescript: Type safety
- tailwindcss: Styling
- axios: HTTP client
- zustand: State management

## 🔄 Geliştirme Workflow

1. **Backend Geliştirme**
   - API route tanımla (routes/)
   - Controller yazıp işlemi yap (controllers/)
   - Service katmanında database işlemleri (services/)
   - Middleware'ler ekle (middlewares/)

2. **Frontend Geliştirme**
   - TypeScript tipler tanımla (types/)
   - Custom hooks yazıp (hooks/)
   - Bileşenleri geliştir (components/)
   - Sayfa oluştur (pages/)

3. **API Bağlantısı**
   - API client kullan (lib/api.ts)
   - Token yönetimi yapılır otomatik
   - Error handling mekanizması var

## 🎯 Scalability Önerileri

1. **Caching**
   - Redis cache eklenebilir
   - Client-side caching (SWR, React Query)

2. **Database Optimizasyon**
   - Firestore indexes oluştur
   - Composite queries optimize et

3. **API Versioning**
   - URL'de versiyon saklı (v1, v2...)

4. **Microservices**
   - Büyüdüğünde ayrı servisler yararat

## 📱 React Native Dönüşümü

Bu proje kolayca React Native'e dönüştürülebilir:

```
Reusable Hooks: ✅ useTimer, useAudioPlayer
Type Definitions: ✅ TypeScript types shared
API Client: ✅ Platform-agnostic
State Management: ✅ Zustand (platform-agnostic)
```

Sadece UI bileşenleri React Native bileşenleriyle değiştirilirse yeterli olur.

## 🧪 Testing Stratejisi (Önerilen)

```
- Jest: Unit tests
- React Testing Library: Component tests
- Cypress: E2E tests
- Supertest: API tests
```

---

**Son Güncelleme**: Şubat 2024
**Versiyon**: 1.0.0
