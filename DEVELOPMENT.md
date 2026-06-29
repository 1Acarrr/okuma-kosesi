# Okuma Köşesi - Geliştirme Rehberi

## 🚀 Kurulum & Başlangıç (Step-by-Step)

### 1. Ön Koşullar

```bash
# Kurulu olması gereken yazılımlar:
- Node.js (v18+)
- npm veya yarn
- Git
- Code editor (VS Code önerilir)

# Kurulumu doğrula:
node --version    # v18.0.0 veya üzeri
npm --version     # 9.0.0 veya üzeri
```

### 2. Projeyi Klonlayın

```bash
# Proje klasörüne git
cd okuma-kosesi
```

### 3. Backend Kurulumu

```bash
# Backend klasörüne git
cd server

# Paketleri yükle
npm install

# .env dosyasını oluştur
cp .env.example .env

# Firebase bilgilerinizi .env dosyasına ekleyin:
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY=your-private-key
# FIREBASE_CLIENT_EMAIL=your-service-account-email
# PORT=5000
# FRONTEND_URL=http://localhost:3000

# Development modunda çalıştır
npm run dev

# Terminal'de göreceksiniz:
# 🚀 Okuma Köşesi Server is running on port 5000
```

### 4. Frontend Kurulumu (Yeni Terminal Penceresi)

```bash
# Ana dizine geri dön
cd ..

# Frontend klasörüne git
cd client

# Paketleri yükle
npm install

# .env dosyasını oluştur
cp .env.local.example .env.local

# Development modunda çalıştır
npm run dev

# Terminal'de göreceksiniz:
# ▲ Next.js 14.0.0
# - Local: http://localhost:3000
```

### 5. Uygulamaya Erişim

```
Browser'da aç: http://localhost:3000
```

---

## 📋 API Endpoint'leri

### Books Endpoints

```
GET     /api/v1/books              - Tüm kitapları getir
POST    /api/v1/books              - Yeni kitap ekle
GET     /api/v1/books/:bookId      - Spesifik kitabı getir
PUT     /api/v1/books/:bookId      - Kitabı güncelle
DELETE  /api/v1/books/:bookId      - Kitabı sil
POST    /api/v1/books/:bookId/sessions - Okuma seansı kaydet
```

**POST /books - Yeni Kitap Örneği**
```json
Request:
{
  "title": "Suç ve Ceza",
  "author": "Fyodor Dostoyevski",
  "totalPages": 671,
  "coverUrl": "https://example.com/image.jpg"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "userId": "user-id",
    "title": "Suç ve Ceza",
    "author": "Fyodor Dostoyevski",
    "totalPages": 671,
    "currentPage": 0,
    "createdAt": "2024-02-01T10:00:00Z",
    "updatedAt": "2024-02-01T10:00:00Z"
  }
}
```

**POST /books/:bookId/sessions - Okuma Seansı Örneği**
```json
Request:
{
  "durationMinutes": 45,
  "pagesRead": 25
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "bookId": "book-id",
    "durationMinutes": 45,
    "pagesRead": 25,
    "date": "2024-02-01T10:00:00Z"
  }
}
```

### Notes Endpoints

```
GET     /api/v1/books/:bookId/notes         - Kitap notlarını getir
POST    /api/v1/books/:bookId/notes         - Not ekle
PUT     /api/v1/books/:bookId/notes/:noteId - Notu güncelle
DELETE  /api/v1/books/:bookId/notes/:noteId - Notu sil
```

**POST /books/:bookId/notes Örneği**
```json
Request:
{
  "content": "Bu bölüm çok etkileyici",
  "pageNumber": 150,
  "highlight": "\"Suç, utançtan daha büyük bir cezalandırmadır.\""
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "userId": "user-id",
    "bookId": "book-id",
    "content": "Bu bölüm çok etkileyici",
    "pageNumber": 150,
    "highlight": "\"Suç, utançtan daha büyük bir cezalandırmadır.\"",
    "createdAt": "2024-02-01T10:00:00Z",
    "updatedAt": "2024-02-01T10:00:00Z"
  }
}
```

### Stats Endpoints

```
GET     /api/v1/stats/daily              - Günlük istatistikler
GET     /api/v1/stats/weekly             - Haftalık istatistikler
GET     /api/v1/stats/summary            - Özet istatistikler
GET     /api/v1/stats/books/:bookId      - Kitap istatistikleri
```

**GET /stats/summary Response Örneği**
```json
{
  "success": true,
  "data": {
    "totalBooksRead": 5,
    "totalReadingMinutes": 1250,
    "totalSessions": 42,
    "averageSessionDuration": 30,
    "mostReadBook": {
      "id": "book-id",
      "title": "1984",
      "minutes": 320
    }
  }
}
```

### Sounds Endpoint

```
GET     /api/v1/sounds              - Tüm sesleri getir
GET     /api/v1/sounds/:soundId     - Spesifik sesi getir
```

---

## 🛠️ Backend Geliştirme Kılavuzu

### Yeni Controller Ekleme

```typescript
// src/controllers/exampleController.ts
import { Request, Response } from 'express';
import { ExampleService } from '@services/exampleService';

export class ExampleController {
  static async getExample(req: Request, res: Response) {
    try {
      const result = await ExampleService.getExample();
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch example'
      });
    }
  }
}
```

### Yeni Service Ekleme

```typescript
// src/services/exampleService.ts
import { getFirestore } from '@config/firebase';

export class ExampleService {
  static async getExample() {
    try {
      const db = getFirestore();
      // Database işlemleri
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}
```

### Yeni Route Ekleme

```typescript
// src/routes/exampleRoutes.ts
import { Router } from 'express';
import { ExampleController } from '@controllers/exampleController';
import { authMiddleware } from '@middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', ExampleController.getExample);

export default router;

// Sonra index.ts'de ekle:
// apiV1.use('/examples', exampleRoutes);
```

### Validation Örneği (Joi)

```typescript
import Joi from 'joi';

const bookSchema = Joi.object({
  title: Joi.string().required().max(255),
  author: Joi.string().required().max(255),
  totalPages: Joi.number().positive(),
  coverUrl: Joi.string().uri()
});

// Kullanımı:
const { error, value } = bookSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.message });
}
```

---

## 🎨 Frontend Geliştirme Kılavuzu

### Yeni Component Ekleme

```typescript
// src/components/ExampleComponent.tsx
'use client';

import React from 'react';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Aksiyon
        </button>
      )}
    </div>
  );
};
```

### Yeni Custom Hook

```typescript
// src/hooks/useExample.ts
import { useState, useCallback } from 'react';

export const useExample = () => {
  const [state, setState] = useState(null);

  const action = useCallback(() => {
    // Logic here
    setState(newValue);
  }, []);

  return { state, action };
};
```

### Yeni Sayfa Ekleme

```typescript
// src/pages/example.tsx
'use client';

import React from 'react';

export default function ExamplePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-100">
          Örnek Sayfa
        </h1>
        {/* Content */}
      </div>
    </main>
  );
}
```

### API Çağrısı Örneği

```typescript
import apiClient from '@lib/api';
import { useEffect, useState } from 'react';

export const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/endpoint');
        setData(response.data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? 'Yükleniyor...' : <div>{/* data */}</div>}
    </div>
  );
};
```

### Zustand State Kullanımı

```typescript
import { useAppStore } from '@lib/store';

export const MyComponent = () => {
  const { books, addBook } = useAppStore();

  return (
    <div>
      {books.map(book => (
        <div key={book.id}>{book.title}</div>
      ))}
      <button onClick={() => addBook(newBook)}>
        Kitap Ekle
      </button>
    </div>
  );
};
```

---

## 🔄 Ortak Geliştirme Workflow

### 1. Yeni Feature Başlatma

```bash
# Backend
cd server
npm run dev

# Frontend (Yeni terminal)
cd client
npm run dev

# Browse: http://localhost:3000
```

### 2. Backend Geliştirme Adımları

```
1. Service katmanında database işlemini yaz
2. Controller'da işlemi kullan
3. Route'u oluştur
4. Index.ts'de route'u kaydet
5. Postman/Insomnia'da test et
```

### 3. Frontend Geliştirme Adımları

```
1. TypeScript tip tanımlamalarını yap
2. Component oluştur
3. Sayfada component'i kullan
4. API bağlantısını yap
5. Browser'da test et
```

### 4. Full-Stack Test

```
1. Backend API'yi test et
2. Frontend component'i oluştur
3. API'ye bağlan
4. End-to-end test et
5. Error handling kontrol et
```

---

## 🐛 Debugging

### Backend Debugging

```typescript
// Konsol logları
console.log('Debug:', data);
console.error('Error:', error);

// VS Code Debug
// launch.json ekle ve F5 ile başlat
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/server/dist/index.js"
}
```

### Frontend Debugging

```typescript
// Browser DevTools (F12)
// Network: API çağrılarını kontrol et
// Console: Hataları gör
// React DevTools: State debug et

// Zustand DevTools'un
import { useShallow } from 'zustand/react/shallow'
```

---

## 📦 Build & Deploy

### Backend Build

```bash
cd server
npm run build
npm start
```

### Frontend Build

```bash
cd client
npm run build
npm start
```

---

## 🧪 Testing Örneği

### Backend Test (Jest)

```typescript
// src/services/bookService.test.ts
describe('BookService', () => {
  it('should fetch books', async () => {
    const books = await BookService.getBooks('user-id');
    expect(Array.isArray(books)).toBe(true);
  });
});
```

### Frontend Test (React Testing Library)

```typescript
// src/components/BookCard.test.tsx
import { render, screen } from '@testing-library/react';
import { BookCard } from '@components/BookCard';

describe('BookCard', () => {
  it('should render book title', () => {
    render(<BookCard book={mockBook} />);
    expect(screen.getByText(mockBook.title)).toBeInTheDocument();
  });
});
```

---

## 📝 Kodlama Standartları

### TypeScript Conventions

```typescript
// ✅ İyi
interface User {
  id: string;
  name: string;
}

const user: User = { id: '1', name: 'John' };

// ❌ Kötü
const user: any = { id: '1', name: 'John' };
```

### React Component Conventions

```typescript
// ✅ İyi
'use client';
interface Props { title: string; }
export const MyComponent: React.FC<Props> = ({ title }) => (...)

// ❌ Kötü
export default function MyComponent(props) { ... }
```

### CSS Classes (Tailwind)

```typescript
// ✅ İyi
className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"

// ❌ Kötü
className="p-2 bg-blue-500"
```

---

## 📚 Kullanışlı Kaynaklar

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Express.js Docs](https://expressjs.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

---

## 🆘 Sorun Giderme

### CORS Hatası

```
Çözüm: server/src/index.ts'de CORS yapılandırmasını kontrol et
origin: process.env.FRONTEND_URL
```

### Firebase Hatası

```
Çözüm: .env dosyası kontrol et, Firebase kredisi doğru gir
```

### Port Zaten Kullanımda

```bash
# Başka bir port kullan
PORT=5001 npm run dev

# Veya portu boşalt
lsof -i :5000  # Port'u kullanan process bul
kill -9 <PID>  # Proces'i kapat
```

### Module Not Found

```bash
# Path aliases kontrol et (tsconfig.json)
# Dosya isimlerini kontrol et (case-sensitive)
npm install  # Yeniden yükle
```

---

## 🎯 Sonraki Adımlar (Roadmap)

- [ ] Authentication (Firebase) implementasyonu
- [ ] Advanced statistics (grafikleri, chartsler)
- [ ] Offline mode (Service Worker)
- [ ] Mobile app (React Native)
- [ ] Social features (sharing, collaboration)
- [ ] Premium features
- [ ] Dark/Light mode seçeneği
- [ ] Multilingual support

---

**Sorularınız veya önerileriniz için lütfen issue açınız.**
