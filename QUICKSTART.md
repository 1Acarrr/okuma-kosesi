# ⚡ Okuma Köşesi - Hızlı Başlangıç

## 30 Saniyede Başlayın

### 1️⃣ Terminal 1 - Backend Başlat

```bash
cd okuma-kosesi/server
npm install
cp .env.example .env

# .env dosyasını düzenle ve Firebase bilgilerini ekle
# Açık: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL

npm run dev
```

**Beklenen Çıkış:**
```
🚀 Okuma Köşesi Server is running on port 5000
```

### 2️⃣ Terminal 2 - Frontend Başlat

```bash
cd okuma-kosesi/client
npm install
cp .env.local.example .env.local
npm run dev
```

**Beklenen Çıkış:**
```
▲ Next.js 14.0.0
- Local: http://localhost:3000
```

### 3️⃣ Tarayıcı Aç

```
http://localhost:3000
```

---

## 🎯 İlk Test

### 1. Ana Sayfa Kontrol
- [ ] "🎯 Odak Moduna Başla" butonu var mı?
- [ ] "📚 Kitaplarımı Gör" butonu var mı?

### 2. Odak Modu Test
```
Adım 1: http://localhost:3000/focus
Adım 2: Bir ses seç (Yağmur, Orman vb.)
Adım 3: Timer'ı başlat
Adım 4: ▶ Başlat butonuna tıkla
```

### 3. Kitap Test
```
Adım 1: http://localhost:3000/books
Adım 2: ➕ Kitap Ekle
Adım 3: 
  Kitap Adı: "1984"
  Yazar: "George Orwell"
  Sayfa: 328
Adım 4: Kaydet
```

### 4. API Test (Postman/curl)

```bash
# Books listesini getir
curl -H "Authorization: Bearer test-token" \
  http://localhost:5000/api/v1/books

# Yeni kitap ekle
curl -X POST http://localhost:5000/api/v1/books \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1984",
    "author": "George Orwell",
    "totalPages": 328
  }'

# Sesleri listele
curl http://localhost:5000/api/v1/sounds
```

---

## 📁 Proje Yapısı Özeti

```
okuma-kosesi/
│
├── 📄 README.md              ← Proje açıklaması
├── 📄 ARCHITECTURE.md        ← Mimarisi detaylı
├── 📄 DEVELOPMENT.md         ← Geliştirme rehberi
├── 📄 PACKAGES.md            ← Paket dokümantasyonu
├── 📄 PROJECT_SUMMARY.md     ← Proje özeti
│
├── 📁 server/                ← BACKEND
│   ├── src/
│   │   ├── index.ts          ← Ana dosya
│   │   ├── controllers/      ← İş mantığı (4 dosya)
│   │   ├── routes/           ← API rotaları (5 dosya)
│   │   ├── services/         ← Database (3 dosya)
│   │   ├── middlewares/      ← Auth middleware
│   │   └── config/           ← Firebase config
│   ├── package.json
│   └── tsconfig.json
│
└── 📁 client/                ← FRONTEND
    ├── src/
    │   ├── pages/            ← Sayfalar (6 dosya)
    │   ├── components/       ← Bileşenler (6 dosya)
    │   ├── hooks/            ← Custom hooks (2 dosya)
    │   ├── lib/              ← Helpers (api.ts, store.ts)
    │   ├── types/            ← TypeScript tipler
    │   └── styles/           ← Global CSS
    ├── package.json
    └── next.config.js
```

---

## 🔧 Kullanışlı Komutlar

```bash
# Backend
cd server
npm run dev          # Development modunda çalıştır
npm run build        # Build et
npm start            # Production çalıştır
npm run lint         # Lint kontrol

# Frontend
cd client
npm run dev          # Development modunda çalıştır
npm run build        # Build et
npm start            # Production çalıştır
npm run lint         # Lint kontrol
```

---

## 🆘 Yaygın Sorunlar

### ❌ "Cannot find module 'firebase-admin'"

```bash
cd server
npm install
```

### ❌ "Port 5000 already in use"

```bash
# Port değiştir
PORT=5001 npm run dev

# Veya portu boşalt (Windows)
taskkill /PID <pid> /F
```

### ❌ "Firebase credential error"

```
✅ Kontrol listesi:
- .env dosyası oluştu mu? (cp .env.example .env)
- FIREBASE_PROJECT_ID var mı?
- FIREBASE_PRIVATE_KEY var mı? (\\n karakterleri kontrol et)
- FIREBASE_CLIENT_EMAIL var mı?
```

### ❌ "CORS error"

```
✅ server/.env kontrol et:
- FRONTEND_URL=http://localhost:3000
```

---

## 📚 API Endpoints

```bash
# Kitaplar
GET    /api/v1/books
POST   /api/v1/books
PUT    /api/v1/books/:id
DELETE /api/v1/books/:id

# Notlar
GET    /api/v1/books/:bookId/notes
POST   /api/v1/books/:bookId/notes
PUT    /api/v1/books/:bookId/notes/:noteId
DELETE /api/v1/books/:bookId/notes/:noteId

# İstatistikler
GET    /api/v1/stats/daily
GET    /api/v1/stats/weekly
GET    /api/v1/stats/summary

# Sesler
GET    /api/v1/sounds
```

---

## 📱 Sayfalar

| URL | Açıklama |
|-----|----------|
| `/` | Ana sayfa |
| `/focus` | Odak modu (timer + sesler) |
| `/books` | Kitap yönetimi |
| `/stats` | İstatistikler |
| `/credits` | Telifler & Lisanslar |

---

## 🚀 Sonraki Adımlar

1. ✅ **Backend başlat**: `npm run dev` (server/)
2. ✅ **Frontend başlat**: `npm run dev` (client/)
3. ✅ **Firebase ayarla**: .env dosyalarını doldur
4. 📚 **Doküman oku**: DEVELOPMENT.md
5. 🔧 **Geliştirmeye başla**: Kod değişiklikleri yap

---

## 📞 Yardım

### Soruların Var mı?
1. [README.md](./README.md) - Proje açıklaması
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Sistem mimarisi
3. [DEVELOPMENT.md](./DEVELOPMENT.md) - Detaylı geliştirme rehberi
4. [PACKAGES.md](./PACKAGES.md) - Paket dokümantasyonu

### IDE Setup (VS Code Önerilir)

```json
Extensions:
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- REST Client (API test)
- Thunder Client (API test)
```

---

## ✅ Başarı Kontrol Listesi

```
Backend Kurulumu
- [ ] npm install başarılı
- [ ] .env dosyası oluştu
- [ ] Firebase credentials var
- [ ] Port 5000'de çalışıyor
- [ ] API http://localhost:5000/api/health 200 dönüyor

Frontend Kurulumu
- [ ] npm install başarılı
- [ ] .env.local dosyası oluştu
- [ ] Port 3000'de çalışıyor
- [ ] Sayfalar load oluyor
- [ ] Navigation menüsü görülüyor

Temel Özellikler
- [ ] Kitap eklenebiliyor
- [ ] Timer çalışıyor
- [ ] Sesler oynatılıyor
- [ ] İstatistikler gösteriliyor
- [ ] Notlar eklenebiliyor

Responsive Design
- [ ] Desktop görünüşü tamam
- [ ] Tablet görünüşü tamam
- [ ] Mobil görünüşü tamam
```

---

## 🎉 Tebrikler!

Okuma Köşesi başarıyla kurulmuştur! 

Artık:
- 📖 Kitap okuyabilirsiniz
- ⏱️ Zamanlayıcı ile sesli oturumlar başlatabilirsiniz
- 📝 Notlar ekleyebilirsiniz
- 📊 İstatistikleri izleyebilirsiniz

**Mutlu okumalar!** 🎯

---

**Versiyon**: 1.0.0  
**Güncelleme**: Şubat 2024  
**Durum**: ✅ Production Ready
