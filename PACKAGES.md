# Okuma Köşesi - Paket Bağımlılıkları

## Backend Paketleri

### Dependencies (Üretim)

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| `express` | ^4.18.2 | Web server framework |
| `firebase-admin` | ^12.0.0 | Firebase SDK |
| `cors` | ^2.8.5 | CORS middleware |
| `dotenv` | ^16.3.1 | Environment variables |
| `joi` | ^17.11.0 | Schema validation |
| `uuid` | ^9.0.1 | Unique ID generator |

### DevDependencies

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| `@types/express` | ^4.17.20 | Express tipler |
| `@types/node` | ^20.10.0 | Node.js tipler |
| `@types/uuid` | ^9.0.7 | UUID tipler |
| `typescript` | ^5.3.2 | TypeScript derleyicisi |
| `ts-node-dev` | ^2.0.0 | TypeScript geliştirme sunucusu |
| `eslint` | ^8.55.0 | Kod analizcisi |
| `@typescript-eslint/eslint-plugin` | ^6.13.1 | TypeScript ESLint eklentisi |
| `@typescript-eslint/parser` | ^6.13.1 | TypeScript ESLint parser'ı |
| `jest` | ^29.7.0 | Test framework |
| `ts-jest` | ^29.1.1 | Jest TypeScript desteği |
| `@types/jest` | ^29.5.8 | Jest tipler |

## Frontend Paketleri

### Dependencies (Üretim)

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| `next` | ^14.0.0 | React framework |
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | React DOM |
| `typescript` | ^5.3.2 | TypeScript |
| `axios` | ^1.6.2 | HTTP istemcisi |
| `zustand` | ^4.4.0 | State management |
| `tailwindcss` | ^3.3.6 | CSS framework |
| `autoprefixer` | ^10.4.16 | CSS vendor prefixes |
| `postcss` | ^8.4.31 | CSS processor |

### DevDependencies

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| `@types/react` | ^18.2.31 | React tipler |
| `@types/react-dom` | ^18.2.14 | React DOM tipler |
| `@types/node` | ^20.10.0 | Node.js tipler |
| `eslint` | ^8.55.0 | Kod analizcisi |
| `eslint-config-next` | ^14.0.0 | Next.js ESLint config |

---

## Kurulum Komutları

### Backend Paketleri Yüklemek

```bash
cd server
npm install

# Tek bir paket yüklemek
npm install express

# Dev dependency olarak yüklemek
npm install --save-dev typescript
```

### Frontend Paketleri Yüklemek

```bash
cd client
npm install

# Tek bir paket yüklemek
npm install react

# Dev dependency olarak yüklemek
npm install --save-dev tailwindcss
```

---

## Paket Kullanımı

### Express
```typescript
import express from 'express';
const app = express();
app.get('/', (req, res) => res.json({ message: 'OK' }));
```

### Firebase Admin SDK
```typescript
import admin from 'firebase-admin';
const db = admin.firestore();
const auth = admin.auth();
```

### CORS
```typescript
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:3000' }));
```

### Joi (Validation)
```typescript
import Joi from 'joi';
const schema = Joi.object({ name: Joi.string().required() });
```

### UUID
```typescript
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();
```

### Axios (Frontend)
```typescript
import axios from 'axios';
const response = await axios.get('/api/books');
```

### Zustand (State Management)
```typescript
import { create } from 'zustand';
const store = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));
```

### Tailwind CSS
```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
  Click me
</button>
```

---

## Paket Güncelleme

### Güncellemeleri Kontrol Etme

```bash
npm outdated
```

### Paketleri Güncelleme

```bash
# Tüm paketleri güncelle
npm update

# Spesifik paketi güncelle
npm install <package>@latest

# Major versiyon güncellemesi (dikkatli olun)
npm install <package>@next
```

---

## Paket Kaldırma

```bash
npm uninstall <package>

# Dev dependency'den kaldırma
npm uninstall --save-dev <package>
```

---

## Alternatif Paketler

### State Management
- ✅ **Zustand** (Mevcut) - Hafif ve basit
- Redux - Daha karmaşık ama güçlü
- Recoil - Facebook'un başka bir çözümü
- Jotai - Zustand'a benzer

### HTTP İstemci
- ✅ **Axios** (Mevcut) - Kullanımı kolay
- Fetch API - Native (modern tarayıcılar)
- React Query - Caching ve senkronizasyon

### Validation
- ✅ **Joi** (Mevcut) - Kapsamlı
- Zod - TypeScript-first
- Yup - Basit ve popüler

### CSS Framework
- ✅ **Tailwind** (Mevcut) - Utility-first
- Bootstrap - Component-based
- Material UI - Google Material Design
- Chakra UI - Accessibility-focused

---

## Performance İpuçları

### Bundle Size Azaltma

```bash
# Bundle size'ı analiz et
npm run build
npm install -g webpack-bundle-analyzer
```

### Paket Seçimi

- ✅ Küçük ve hafif paketleri tercih edin
- ✅ Tree-shaking destekleyen paketleri kullanın
- ❌ Çok fazla paket bağımlılığı eklemekten kaçının

---

## Güvenlik

### Güvenlik Açıkları Kontrol Etme

```bash
npm audit
```

### Güvenlik Açıklarını Düzeltme

```bash
npm audit fix
npm audit fix --force  # Dikkatli, versiyon değiştirebilir
```

---

## Versioning

### Semantic Versioning
```
MAJOR.MINOR.PATCH
1.2.3
│ │ └─ Patch (bug fixes)
│ └─── Minor (new features, backward compatible)
└───── Major (breaking changes)
```

### Package.json Operators
```json
{
  "exact": "1.0.0",           // tam 1.0.0
  "caret": "^1.0.0",          // 1.0.0 - 1.9.9
  "tilde": "~1.0.0",          // 1.0.0 - 1.0.9
  "latest": "*"               // en son versiyon
}
```

---

## NPM Scripts

### Backend Scripts

```bash
npm run dev        # Development modunda çalıştır
npm run build      # TypeScript build et
npm start          # Production'da çalıştır
npm run lint       # Kod lint et
npm test           # Testleri çalıştır
```

### Frontend Scripts

```bash
npm run dev        # Development sunucusu (port 3000)
npm run build      # Production build et
npm start          # Production sunucusu
npm run lint       # Kod lint et
```

---

## Sık Sorulan Sorular

**S: npm install vs npm ci?**
> - `npm install`: Development'ta paketleri yükle
> - `npm ci`: CI/CD'de reproducible build için

**S: package-lock.json nedir?**
> Tam paket versiyonlarını kilitleyen dosya. Git'e commit edilmelidir.

**S: Hangi Node.js versiyonu?**
> LTS versiyonu önerilir. Şu an v20 LTS.

**S: Global vs local paketler?**
> - Global: `npm install -g` (CLI tools)
> - Local: `npm install` (project dependencies)

---

## Kaynaklar

- [npm Documentation](https://docs.npmjs.com)
- [Node.js Best Practices](https://nodejs.org/en/docs)
- [Npm Security Advisories](https://github.com/advisories)

