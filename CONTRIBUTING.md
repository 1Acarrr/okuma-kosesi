# Katkıda Bulunma Rehberi (Contributing Guidelines)

Okuma Köşesi projesine ilgi duyduğunuz için teşekkür ederiz! Bu proje tamamen açık kaynaktır ve topluluğun destekleriyle büyümeyi hedefler. Kod tabanımızı temiz, anlaşılır ve güvenli tutmak için lütfen aşağıdaki yönergeleri izleyin.

## Nasıl Katkıda Bulunabilirsiniz?

1. **Hata (Bug) Bildirimi:** Karşılaştığınız sorunları Github "Issues" kısmından bildirebilirsiniz.
2. **Özellik Önerisi:** Yeni fikirlerinizi "Issues" kısmında tartışmaya açabilirsiniz.
3. **Kod Katkısı (Pull Request):** Kod geliştirerek projeye doğrudan katkı sağlayabilirsiniz.

## Pull Request (PR) Süreci ve En Doğru Yapı

Kod tabanına katkıda bulunurken lütfen aşağıdaki Git ve Pull Request iş akışını takip edin:

### 1. Kendi Kopyanızı Oluşturun (Fork)
Projeyi kendi GitHub hesabınıza *fork*layın ve bilgisayarınıza klonlayın.

```bash
git clone https://github.com/SizinKullaniciAdiniz/okuma-kosesi.git
cd okuma-kosesi
```

### 2. Orijinal Depoyu Ekleyin (Upstream)
```bash
git remote add upstream https://github.com/1Acarrr/okuma-kosesi.git
```

### 3. Yeni Bir Dal (Branch) Oluşturun
Asla doğrudan `main` dalı üzerinde geliştirme yapmayın. Yapacağınız değişikliği anlatan anlamlı bir isimle yeni bir branch oluşturun.
- Yeni bir özellik için: `feat/karanlik-tema`
- Hata düzeltmesi için: `fix/giris-hatasi`
- Dokümantasyon için: `docs/readme-guncellemesi`

```bash
git checkout -b feat/sizin-ozelliginiz
```

### 4. Geliştirme ve Test
Değişikliklerinizi yapın. Lütfen projenin mevcut kod yapısına (ESLint, Prettier veya TypeScript kurallarına) uymaya özen gösterin.
Özellikle istemci ve sunucu için TypeScript kontrollerini mutlaka yapın:
```bash
cd client && npm run type-check
cd ../server && npx tsc --noEmit
```

### 5. Anlamlı Commit Mesajları (Conventional Commits)
Değişikliklerinizi kaydederken açıklayıcı mesajlar kullanın:
- `feat: İstatistik sayfasına aylık okuma grafiği eklendi`
- `fix: Mobil menüdeki ikon taşma sorunu çözüldü`
- `refactor: Kitap kartı bileşeni daha okunabilir hale getirildi`

### 6. Pull Request (PR) Gönderin
Değişikliklerinizi kendi deponuza pushlayın ve orijinal deponun `main` dalına doğru bir Pull Request açın.
```bash
git push origin feat/sizin-ozelliginiz
```

Açacağınız Pull Request, projedeki standart **PR Şablonu (Pull Request Template)** formatına uygun olmalıdır. Şablonda sizden ne yaptığınızı, nasıl test ettiğinizi ve varsa hangi issue'yu kapattığınızı açıklamanız istenecektir.

## Kod Yazım Standartları
- Değişken ve fonksiyon isimlerinde İngilizce (camelCase) kullanılmaktadır.
- Component'ler (bileşenler) her zaman büyük harfle başlamalıdır (PascalCase).
- Kod tekrarından kaçının, mümkün olduğunca tekrar kullanılabilir (reusable) bileşenler oluşturun.

Emekleriniz ve katkılarınız için şimdiden teşekkürler! 🚀
