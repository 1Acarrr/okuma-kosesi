import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAppStore } from '../lib/store';
import apiClient from '../lib/api';
import { RecommendationEngine, RecommendationResult } from '../lib/RecommendationEngine';

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    pageCount?: number;
    imageLinks?: { thumbnail?: string; large?: string };
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    publishedDate?: string;
    publisher?: string;
    previewLink?: string;
  };
}

interface CategoryRow {
  id: string;
  title: string;
  queries: string[];
  books: GoogleBookItem[];
}

// Geniş ve özgün kategori listesi
const ALL_CATEGORIES: Omit<CategoryRow, 'books'>[] = [
  { id: 'popular', title: 'Çok Okunanlar', queries: ['inauthor:"zülfü livaneli"', 'inauthor:"ahmet ümit"', 'inauthor:"elif şafak"', 'inauthor:"ihsan oktay anar"'] },
  { id: 'classics', title: 'Dünya Klasikleri', queries: ['inauthor:dostoyevski', 'inauthor:tolstoy', 'inauthor:"victor hugo"', 'inauthor:kafka'] },
  { id: 'turkish', title: 'Türk Edebiyatı', queries: ['inauthor:"sabahattin ali"', 'inauthor:"orhan pamuk"', 'inauthor:"yaşar kemal"', 'inauthor:"oğuz atay"'] },
  { id: 'scifi', title: 'Bilim Kurgu', queries: ['inauthor:asimov', 'inauthor:"frank herbert"', 'inauthor:"arthur c. clarke"', 'inauthor:"ursula k. le guin"'] },
  { id: 'fantasy', title: 'Fantastik & Macera', queries: ['inauthor:tolkien', 'inauthor:"j.k. rowling"', 'inauthor:"george r.r. martin"', 'inauthor:"patrick rothfuss"'] },
  { id: 'mystery', title: 'Polisiye & Gerilim', queries: ['inauthor:"agatha christie"', 'inauthor:"sir arthur conan doyle"', 'inauthor:"dan brown"', 'inauthor:"jean-christophe grangé"'] },
  { id: 'history', title: 'Tarih & Biyografi', queries: ['inauthor:"ilber ortaylı"', 'inauthor:"halil inalcık"', 'inauthor:"stefan zweig"', 'inauthor:"amin maalouf"'] },
  { id: 'philosophy', title: 'Felsefe', queries: ['inauthor:nietzsche', 'inauthor:platon', 'inauthor:schopenhauer', 'inauthor:camus'] },
  { id: 'psychology', title: 'Psikoloji', queries: ['inauthor:freud', 'inauthor:jung', 'inauthor:"alfred adler"', 'inauthor:"engin geçtan"'] },
  { id: 'selfhelp', title: 'Kişisel Gelişim', queries: ['inauthor:"doğan cüceloğlu"', 'inauthor:"robin sharma"', 'inauthor:"mark manson"', 'inauthor:"üstün dökmen"'] },
  { id: 'science', title: 'Bilim & Keşifler', queries: ['inauthor:"carl sagan"', 'inauthor:"stephen hawking"', 'inauthor:"richard dawkins"', 'inauthor:"yuval noah harari"'] },
  { id: 'poetry', title: 'Şiir', queries: ['inauthor:"cemal süreya"', 'inauthor:"nazım hikmet"', 'inauthor:"orhan veli kanık"', 'inauthor:"özdemir asaf"'] },
  { id: 'romance', title: 'Aşk & Dram', queries: ['inauthor:"jane austen"', 'inauthor:"emily brontë"', 'inauthor:"jojo moyes"', 'inauthor:"sarah jio"'] },
  { id: 'children', title: 'Çocuk & Genç', queries: ['inauthor:"antoine de saint-exupéry"', 'inauthor:"roald dahl"', 'inauthor:"suzanne collins"', 'inauthor:"rick riordan"'] },
  { id: 'economics', title: 'Ekonomi & İş Dünyası', queries: ['inauthor:"mahfi eğilmez"', 'inauthor:"adam smith"', 'inauthor:"daron acemoğlu"', 'inauthor:"robert kiyosaki"'] },
];

// İlk yüklenmede gösterilecek kategoriler (ID listesi)
const INITIAL_CATEGORY_IDS = ['popular', 'classics', 'turkish', 'scifi', 'mystery'];

export default function DiscoverPage() {
  const router = useRouter();
  const { isAuthenticated, addBook, books: myLibrary } = useAppStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [heroBook, setHeroBook] = useState<GoogleBookItem | null>(null);
  const [isLoadingBrowse, setIsLoadingBrowse] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBookItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingBookId, setAddingBookId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<GoogleBookItem | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);       // 0-based page index
  const [totalItems, setTotalItems] = useState(0);          // Google'ın bildirdiği toplam sonuç sayısı
  const [activeApiQueries, setActiveApiQueries] = useState<string[]>([]); // Son yapılan API sorgusu
  const [isCategory, setIsCategory] = useState(false);      // Kategori mi, arama mı?
  
  // AI Recommendations
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  // Dropdown dışına tıklayınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchCategory = async (cat: Omit<CategoryRow, 'books'>): Promise<CategoryRow> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    try {
      const query = cat.queries[0];
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=tr&maxResults=20&orderBy=relevance&key=${apiKey}`);
      const data = await res.json();
      
      if (data.error && data.error.code === 429) {
        console.warn('Google Books API Quota Exceeded. Falling back to OpenLibrary for category:', cat.title);
        const fbRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
        const fbData = await fbRes.json();
        
        const transliterateCyrillic = (text: string) => {
          if (!text) return text;
          
          const knownAuthors: Record<string, string> = {
            'Фёдор Михайлович Достоевский': 'Fyodor Dostoyevski',
            'Лев Николаевич Толстой': 'Lev Tolstoy',
            'Лев Толстой': 'Lev Tolstoy',
            'Антон Павлович Чехов': 'Anton Çehov',
            'Николай Васильевич Гоголь': 'Nikolay Gogol',
            'Максим Горький': 'Maksim Gorki',
            'Иван Сергеевич Тургенев': 'İvan Turgenyev',
            'Александр Сергеевич Пушкин': 'Aleksandr Puşkin',
            'Михаил Афанасьевич Булгаков': 'Mihail Bulgakov'
          };
          
          if (knownAuthors[text]) return knownAuthors[text];

          const map: Record<string, string> = {'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'J','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ç','Ш':'Ş','Щ':'Shch','Ъ':'','Ы':'I','Ь':'','Э':'E','Ю':'Yu','Я':'Ya','а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ç','ш':'ş','щ':'shch','ъ':'','ы':'ı','ь':'','э':'e','ю':'yu','я':'ya'};
          return text.split('').map(c => map[c] || c).join('');
        };

        const fbBooks = (fbData.docs || []).map((doc: any) => ({
          id: doc.key,
          volumeInfo: {
            title: doc.title,
            authors: doc.author_name ? doc.author_name.map(transliterateCyrillic) : undefined,
            pageCount: doc.number_of_pages_median || undefined,
            imageLinks: doc.cover_i ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : null,
            description: typeof doc.first_sentence === 'string' ? doc.first_sentence : doc.first_sentence?.value
          }
        })).filter((item: GoogleBookItem) => item.volumeInfo?.imageLinks?.thumbnail).slice(0, 20);
        return { ...cat, books: fbBooks };
      }

      const books = (data.items || []).filter((item: GoogleBookItem) => item.volumeInfo?.imageLinks?.thumbnail).slice(0, 20);
      return { ...cat, books };
    } catch {
      return { ...cat, books: [] };
    }
  };

  // İlk yükleme (Vitrin kategorilerini çek - Sadece 1 kere çalışır)
  useEffect(() => {
    const fetchBrowseData = async () => {
      // 1. Önce önbelleğe (Cache) bakıyoruz
      const cachedData = sessionStorage.getItem('discover_categories');
      if (cachedData) {
        const results = JSON.parse(cachedData);
        setCategories(results);
        
        const firstWithBooks = results.find((r: CategoryRow) => r.books.length > 0);
        if (firstWithBooks) {
          const goodBooks = firstWithBooks.books.filter(
            (b: GoogleBookItem) => b.volumeInfo.description && b.volumeInfo.description.length > 100
          );
          setHeroBook(goodBooks.length > 0 ? goodBooks[0] : firstWithBooks.books[0]);
        }
        setIsLoadingBrowse(false);
        return;
      }

      // 2. Önbellekte yoksa API'den çekiyoruz
      const initialCats = ALL_CATEGORIES.filter(c => INITIAL_CATEGORY_IDS.includes(c.id));
      
      const results: CategoryRow[] = [];
      for (const cat of initialCats) {
        const res = await fetchCategory(cat);
        results.push(res);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Başarılı çektiysek SessionStorage'a kaydediyoruz
      if (results.some(r => r.books.length > 0)) {
        sessionStorage.setItem('discover_categories', JSON.stringify(results));
      }
      
      setCategories(results);

      // Hero kitabı seç
      const firstWithBooks = results.find(r => r.books.length > 0);
      if (firstWithBooks) {
        const goodBooks = firstWithBooks.books.filter(
          (b: GoogleBookItem) => b.volumeInfo.description && b.volumeInfo.description.length > 100
        );
        setHeroBook(goodBooks.length > 0 ? goodBooks[0] : firstWithBooks.books[0]);
      }
      setIsLoadingBrowse(false);
    };
    fetchBrowseData();
  }, []);

  // AI Recommendations Çek (Kütüphane değiştiğinde güncellenir)
  useEffect(() => {
    const fetchAi = async () => {
      const cacheKey = `discover_ai_${myLibrary?.length || 0}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        setAiRecommendations(JSON.parse(cachedData));
        setIsLoadingAi(false);
        return;
      }

      setIsLoadingAi(true);
      const recommendations = await RecommendationEngine.getRecommendations(myLibrary || []);
      
      if (recommendations.length > 0) {
        sessionStorage.setItem(cacheKey, JSON.stringify(recommendations));
      }
      
      setAiRecommendations(recommendations);
      setIsLoadingAi(false);
    };
    fetchAi();
  }, [myLibrary?.length]);

  const PAGE_SIZE = 36; // Her sayfada 36 kitap (2 paralel API çağrısı: 20 + 16)

  const fetchPage = async (apiQueries: string[], page: number): Promise<{ items: GoogleBookItem[], totalItems: number }> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const itemsPerQuery = Math.ceil(PAGE_SIZE / apiQueries.length);
    const startIndex = page * itemsPerQuery;

    const responses = await Promise.all(apiQueries.map(async (q) => {
      try {
        const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&langRestrict=tr&orderBy=relevance&maxResults=${itemsPerQuery}&startIndex=${startIndex}&key=${apiKey}`);
        const data = await r.json();
        
        if (data.error && data.error.code === 429) {
          console.warn('Google Books API Quota Exceeded. Falling back to OpenLibrary for page query:', q);
          const fbRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${itemsPerQuery}&page=${page + 1}`);
          const fbData = await fbRes.json();
          
          const transliterateCyrillic = (text: string) => {
            if (!text) return text;
            
            const knownAuthors: Record<string, string> = {
              'Фёдор Михайлович Достоевский': 'Fyodor Dostoyevski',
              'Лев Николаевич Толстой': 'Lev Tolstoy',
              'Лев Толстой': 'Lev Tolstoy',
              'Антон Павлович Чехов': 'Anton Çehov',
              'Николай Васильевич Гоголь': 'Nikolay Gogol',
              'Максим Горький': 'Maksim Gorki',
              'Иван Сергеевич Тургенев': 'İvan Turgenyev',
              'Александр Сергеевич Пушкин': 'Aleksandr Puşkin',
              'Михаил Афанасьевич Булгаков': 'Mihail Bulgakov'
            };
            
            if (knownAuthors[text]) return knownAuthors[text];

            const map: Record<string, string> = {'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'J','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ç','Ш':'Ş','Щ':'Shch','Ъ':'','Ы':'I','Ь':'','Э':'E','Ю':'Yu','Я':'Ya','а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ç','ш':'ş','щ':'shch','ъ':'','ы':'ı','ь':'','э':'e','ю':'yu','я':'ya'};
            return text.split('').map(c => map[c] || c).join('');
          };

          return {
            items: (fbData.docs || []).map((doc: any) => ({
              id: doc.key,
              volumeInfo: {
                title: doc.title,
                authors: doc.author_name ? doc.author_name.map(transliterateCyrillic) : undefined,
                pageCount: doc.number_of_pages_median || undefined,
                imageLinks: doc.cover_i ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : null,
                description: typeof doc.first_sentence === 'string' ? doc.first_sentence : doc.first_sentence?.value
              }
            })),
            totalItems: fbData.numFound || 0
          };
        }
        
        return { items: data.items || [], totalItems: data.totalItems || 0 };
      } catch {
        return { items: [], totalItems: 0 };
      }
    }));

    const arrays = responses.map(r => r.items || []);
    const interleaved: GoogleBookItem[] = [];
    const seen = new Set();
    const maxLen = Math.max(...arrays.map(a => a.length), 0);
    
    for (let i = 0; i < maxLen; i++) {
        for (let j = 0; j < arrays.length; j++) {
            if (arrays[j][i] && !seen.has(arrays[j][i].id)) {
                 seen.add(arrays[j][i].id);
                 interleaved.push(arrays[j][i]);
            }
        }
    }

    let totalItemsSum = 0;
    responses.forEach(res => totalItemsSum += (res.totalItems || 0));

    let computedTotalItems = totalItemsSum;
    if (interleaved.length < (apiQueries.length * itemsPerQuery) - apiQueries.length) {
      computedTotalItems = (page * PAGE_SIZE) + interleaved.length;
    }

    return { items: interleaved, totalItems: computedTotalItems };
  };

  // Sayfaya git (hem kategori hem arama için ortak)
  const goToPage = async (page: number, apiQueries: string[], scrollTop = true) => {
    setIsSearching(true);
    try {
      let { items, totalItems } = await fetchPage(apiQueries, page);
      
      // Strict Filter: Google Books API bazen OCR metinlerinde bulduğu alakasız saçma harf dizilerini de döndürür.
      // Eğer bu bir kategori araması değilse (manuel arama ise), sonucun başlık veya yazarda geçmesini zorunlu tut.
      const isManualSearch = !apiQueries.some(q => q.includes('subject:') || q.includes('inauthor:'));
      if (isManualSearch && query.trim()) {
        const lowerQ = query.toLowerCase().trim();
        const keywords = lowerQ.split(/\s+/).filter(w => w.length > 2);
        
        items = items.filter(book => {
          const t = (book.volumeInfo.title || '').toLowerCase();
          const a = (book.volumeInfo.authors || []).join(' ').toLowerCase();
          
          // Tam eşleşme varsa kabul et
          if (t.includes(lowerQ) || a.includes(lowerQ)) return true;
          
          // Kelime bazlı eşleşme (en az bir kelime başlık veya yazarda geçmeli)
          if (keywords.length > 0) {
            return keywords.some(k => t.includes(k) || a.includes(k));
          }
          return false;
        });

        // Filtre sonrası kitap kalmadıysa toplam sayıyı sıfırla
        if (items.length === 0) totalItems = 0;
      }

      setSearchResults(items);
      setTotalItems(totalItems);
      setCurrentPage(page);
    } catch {
      setSearchResults([]);
      setTotalItems(0);
    } finally {
      setIsSearching(false);
    }
    if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Kategori sayfasına git
  const openCategoryPage = async (cat: Omit<CategoryRow, 'books'>) => {
    setDropdownOpen(false);
    setQuery(cat.title);
    setHasSearched(true);
    setCurrentPage(0);
    setActiveApiQueries(cat.queries);
    setIsCategory(true);
    await goToPage(0, cat.queries, false);
  };

  // Arama
  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) { setHasSearched(false); setSearchResults([]); return; }
    setHasSearched(true);
    setCurrentPage(0);
    setActiveApiQueries([query]);
    setIsCategory(false);
    await goToPage(0, [query], false);
  };

  const clearSearch = () => {
    setQuery('');
    setHasSearched(false);
    setSearchResults([]);
    setCurrentPage(0);
    setTotalItems(0);
    setActiveApiQueries([]);
  };

  const handleAddToLibrary = async (book: GoogleBookItem) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setAddingBookId(book.id);
    const info = book.volumeInfo;
    try {
      const response = await apiClient.post('/books', {
        title: info.title,
        author: info.authors?.join(', ') || 'Bilinmeyen Yazar',
        coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        totalPages: info.pageCount || 1,
        currentPage: 0
      });
      addBook(response.data.data);
      alert(`"${info.title}" kitaplığınıza eklendi!`);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Bilinmeyen hata';
      console.error('Add Book Error:', error.response?.data);
      alert(`Kitap eklenemedi: ${errorMsg}`);
    }
    finally { setAddingBookId(null); }
  };

  const scrollRow = (id: string, dir: 'left' | 'right') => {
    document.getElementById(`scroll-${id}`)?.scrollBy({ left: dir === 'left' ? -380 : 380, behavior: 'smooth' });
  };

  const renderBookCard = (book: GoogleBookItem, layout: 'grid' | 'carousel') => {
    const info = book.volumeInfo;
    const cover = info.imageLinks?.thumbnail?.replace('http:', 'https:');
    const isCarousel = layout === 'carousel';
    return (
      <div
        key={book.id}
        onClick={() => setSelectedBook(book)}
        className={`group relative bg-dark-bg-secondary/40 border border-warm-beige/10 rounded-2xl flex flex-col hover:bg-dark-bg-secondary hover:border-warm-beige/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)] flex-shrink-0 cursor-pointer h-full ${isCarousel ? 'w-36 md:w-40 p-2' : 'w-full p-4'}`}
      >
        <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-dark-bg-primary/50 relative border border-warm-beige/5">
          {cover && <img src={cover} alt={info.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToLibrary(book); }}
              disabled={addingBookId === book.id}
              className="w-full py-2.5 bg-warm-beige hover:bg-warm-light text-dark-bg-primary font-black tracking-widest uppercase text-[8px] rounded-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 disabled:opacity-50"
            >
              {addingBookId === book.id ? 'Ekleniyor...' : 'Kitaplığıma Ekle'}
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className={`text-warm-light font-bold line-clamp-2 group-hover:text-warm-beige transition-colors ${isCarousel ? 'text-[11px] mb-0.5' : 'text-sm mb-1'}`} title={info.title}>
            {info.title}
          </h3>
          <p className={`text-warm-beige/40 italic line-clamp-1 ${isCarousel ? 'text-[9px]' : 'text-xs'}`}>
            {info.authors?.join(', ') || 'Bilinmeyen Yazar'}
          </p>
          {!isCarousel && info.pageCount && (
            <div className="mt-2 pt-2 border-t border-warm-beige/5">
              <span className="text-[9px] uppercase tracking-widest text-warm-beige/30 font-black">{info.pageCount} Sayfa</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen bg-dark-bg-primary text-text-light font-sans selection:bg-warm-beige/30 overflow-x-hidden pb-8">

      {/* ── Floating Toolbar ── */}
      <div className="absolute top-0 left-0 right-0 z-40 px-4 md:px-8 pt-4 md:pt-6">
        <div className="max-w-[1400px] mx-auto flex flex-row items-center justify-end gap-2 md:gap-3">

          {/* Kategori Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-warm-beige/10 border border-warm-beige/20 hover:border-warm-beige/50 hover:bg-warm-beige/15 rounded-xl text-warm-beige text-sm font-bold transition-all"
            >
              <span>Kategoriler</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#1f1f1f] border border-warm-beige/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-warm-beige/10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-warm-beige/40 font-black">Keşfedilecek Kategoriler</p>
                </div>
                <div className="py-2 max-h-80 overflow-y-auto">
                  {ALL_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => openCategoryPage(cat)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-warm-beige/8 transition-all group/item"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-warm-light group-hover/item:text-warm-beige">{cat.title}</span>
                      </div>
                      <svg className="w-4 h-4 text-warm-beige/30 group-hover/item:text-warm-beige transition-transform group-hover/item:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Arama */}
          <form onSubmit={searchBooks} className="relative group flex-1 md:flex-none md:w-64 lg:w-96">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-warm-beige/40 group-focus-within:text-warm-beige transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Kitap veya yazar ara..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-dark-bg-secondary/50 border border-warm-beige/10 text-warm-light placeholder:text-warm-beige/20 focus:border-warm-beige/50 focus:bg-dark-bg-secondary/80 focus:outline-none transition-all text-sm"
            />
            {query && (
              <button type="button" onClick={clearSearch} className="absolute inset-y-0 right-3 flex items-center text-warm-beige/40 hover:text-warm-beige">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ── SEARCH MODE ── */}
      {hasSearched ? (
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
            <button onClick={clearSearch} className="flex items-center gap-2 px-4 py-2 bg-dark-bg-secondary border border-warm-beige/20 rounded-xl text-warm-beige text-sm font-bold hover:bg-warm-beige/10 transition-colors self-start">
              ← Vitrine Dön
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-warm-light">
                {isCategory ? (
                  <span className="flex items-center gap-2">
                    <span>{query}</span>
                  </span>
                ) : (
                  <span>"{query}" için sonuçlar</span>
                )}
              </h2>
              {totalItems > 0 && !isSearching && (
                <p className="text-warm-beige/40 text-xs mt-1">
                  Toplamda yaklaşık <span className="text-warm-beige font-bold">{totalItems.toLocaleString()}</span> sonuç
                  &nbsp;·&nbsp;Sayfa <span className="text-warm-beige font-bold">{currentPage + 1}</span> / <span className="text-warm-beige font-bold">{Math.ceil(Math.min(totalItems, 1000) / PAGE_SIZE)}</span>
                  &nbsp;·&nbsp;<span className="text-warm-beige font-bold">{searchResults.length}</span> kitap gösteriliyor
                </p>
              )}
            </div>
          </div>

          {isSearching ? (
            <div className="flex flex-col items-center py-32 gap-6">
              <div className="w-12 h-12 border-4 border-warm-beige/10 border-t-warm-beige rounded-full animate-spin" />
              <p className="text-warm-beige/40 font-bold uppercase tracking-widest text-xs animate-pulse">Raflar Aranıyor...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-32 bg-dark-bg-secondary/20 border-2 border-dashed border-warm-beige/10 rounded-[40px]">
              <p className="text-warm-light text-xl font-bold mb-2">Eşleşme Bulunamadı</p>
              <p className="text-warm-beige/40 text-sm">Farklı kelimeler deneyin.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 animate-in fade-in duration-500 items-stretch">
                {searchResults.map(book => (
                  <div key={book.id} className="flex items-stretch">
                    {renderBookCard(book, 'grid')}
                  </div>
                ))}
              </div>

              {/* ── Sayfa Numaralı Sayfalama ── */}
              {(() => {
                const totalPages = Math.ceil(Math.min(totalItems, 1000) / PAGE_SIZE);
                if (totalPages <= 1) return null;

                // Gösterilecek sayfa numaralarını hesapla
                const getPageNums = () => {
                  const delta = 2;
                  const range: (number | '...')[] = [];
                  const rangeWithDots: (number | '...')[] = [];
                  let l: number | undefined;

                  for (let i = 0; i < totalPages; i++) {
                    if (i === 0 || i === totalPages - 1 || (i >= currentPage - delta && i <= currentPage + delta)) {
                      range.push(i);
                    }
                  }
                  for (const i of range) {
                    if (l !== undefined) {
                      if ((i as number) - l === 2) rangeWithDots.push(l + 1);
                      else if ((i as number) - l > 2) rangeWithDots.push('...');
                    }
                    rangeWithDots.push(i);
                    l = i as number;
                  }
                  return rangeWithDots;
                };

                return (
                  <div className="mt-14 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {/* Önceki */}
                      <button
                        onClick={() => goToPage(currentPage - 1, activeApiQueries)}
                        disabled={currentPage === 0}
                        className="w-10 h-10 rounded-xl border border-warm-beige/15 bg-dark-bg-secondary hover:bg-warm-beige/10 hover:border-warm-beige/40 text-warm-beige/70 hover:text-warm-light transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                      </button>

                      {/* Sayfa numaraları */}
                      {getPageNums().map((pg, idx) =>
                        pg === '...' ? (
                          <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-warm-beige/30 text-sm">...</span>
                        ) : (
                          <button
                            key={pg}
                            onClick={() => goToPage(pg as number, activeApiQueries)}
                            className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all ${pg === currentPage
                              ? 'bg-warm-beige text-dark-bg-primary border-warm-beige shadow-[0_0_15px_rgba(218,185,141,0.3)]'
                              : 'border-warm-beige/15 bg-dark-bg-secondary text-warm-beige/70 hover:bg-warm-beige/10 hover:border-warm-beige/40 hover:text-warm-light'
                              }`}
                          >
                            {(pg as number) + 1}
                          </button>
                        )
                      )}

                      {/* Sonraki */}
                      <button
                        onClick={() => goToPage(currentPage + 1, activeApiQueries)}
                        disabled={currentPage >= totalPages - 1}
                        className="w-10 h-10 rounded-xl border border-warm-beige/15 bg-dark-bg-secondary hover:bg-warm-beige/10 hover:border-warm-beige/40 text-warm-beige/70 hover:text-warm-light transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    <p className="text-warm-beige/25 text-[11px]">
                      Sayfa {currentPage + 1} / {totalPages}
                    </p>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      ) : (
        /* ── BROWSE MODE ── */
        <div className="animate-in fade-in duration-700">
          {isLoadingBrowse ? (
            <div className="flex flex-col items-center justify-center py-64 gap-6">
              <div className="w-16 h-16 border-4 border-warm-beige/10 border-t-warm-beige rounded-full animate-spin" />
              <p className="text-warm-beige/40 font-bold uppercase tracking-widest text-xs animate-pulse">Vitrin Hazırlanıyor...</p>
            </div>
          ) : (
            <>
              {/* HERO */}
              {heroBook && (
                <div className="relative w-full min-h-[55vh] pt-32 pb-14 flex items-center overflow-hidden border-b border-warm-beige/10">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-25 scale-125 blur-[80px]"
                    style={{ backgroundImage: `url(${heroBook.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg-primary via-dark-bg-primary/85 to-dark-bg-primary/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-dark-bg-primary via-dark-bg-primary/55 to-transparent" />

                  <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center md:items-start lg:items-center gap-8 md:gap-12 mt-16 md:mt-0">
                    <div className="relative w-40 md:w-52 flex-shrink-0 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                      <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-warm-beige/20">
                        <img src={heroBook.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')} alt={heroBook.volumeInfo.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -top-6 md:-top-12 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1.5 bg-dark-bg-primary/95 backdrop-blur-md border border-warm-beige/30 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-warm-beige shadow-[0_10px_30px_rgba(0,0,0,0.5)] whitespace-nowrap z-10">
                        Günün Öne Çıkanı
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left mt-10 md:mt-0">

                      <h1 className="text-4xl md:text-6xl font-black text-warm-light tracking-tighter mb-3 leading-tight">
                        {heroBook.volumeInfo.title}
                      </h1>
                      <p className="text-lg text-warm-beige/60 font-serif italic mb-5">
                        {heroBook.volumeInfo.authors?.join(', ')}
                      </p>
                      {heroBook.volumeInfo.description && (
                        <p className="text-warm-beige/40 text-xs md:text-sm max-w-xl leading-relaxed mb-6 md:mb-8 line-clamp-4 md:line-clamp-3">
                          {heroBook.volumeInfo.description}
                        </p>
                      )}
                      <button
                        onClick={() => handleAddToLibrary(heroBook)}
                        disabled={addingBookId === heroBook.id}
                        className="mx-auto md:mx-0 px-8 py-4 bg-warm-beige hover:bg-warm-light text-dark-bg-primary font-black tracking-widest uppercase text-xs rounded-2xl transition-all shadow-[0_0_30px_rgba(255,179,71,0.15)] hover:shadow-[0_0_40px_rgba(255,179,71,0.35)] hover:-translate-y-0.5 active:scale-95 flex items-center gap-2.5 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        {addingBookId === heroBook.id ? 'Ekleniyor...' : 'Kitaplığıma Ekle'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI RECOMMENDATION ROW */}
              {aiRecommendations.length > 0 && (
                <div className="max-w-[1400px] mx-auto pt-10 pb-4">
                  <section className="relative group/section">
                    <div className="px-6 md:px-8 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">

                        <h2 className="flex flex-col">
                          <span className="text-xl md:text-2xl font-black text-warm-light tracking-tight">Sizin İçin Önerilenler</span>
                          <span className="text-xs text-warm-beige/50 font-medium">Algoritma okuma profilinize göre seçti</span>
                        </h2>
                      </div>
                      <div className="hidden md:flex gap-2">
                        <button onClick={() => scrollRow('ai', 'left')} className="p-2 rounded-full bg-dark-bg-secondary border border-warm-beige/15 hover:bg-warm-beige/15 hover:border-warm-beige/40 text-warm-beige/70 hover:text-warm-light transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={() => scrollRow('ai', 'right')} className="p-2 rounded-full bg-dark-bg-secondary border border-warm-beige/15 hover:bg-warm-beige/15 hover:border-warm-beige/40 text-warm-beige/70 hover:text-warm-light transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </div>
                    
                    {isLoadingAi ? (
                      <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-2 border-warm-beige/20 border-t-warm-beige rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div id="scroll-ai" className="flex gap-4 overflow-x-auto px-6 md:px-8 pb-6 pt-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {aiRecommendations.map(rec => (
                          <div key={rec.book.id} className="snap-start flex-shrink-0 flex items-stretch w-64 md:w-72">
                             <div
                                onClick={() => setSelectedBook(rec.book as GoogleBookItem)}
                                className="group relative bg-gradient-to-b from-dark-bg-secondary/80 to-dark-bg-primary border border-warm-beige/15 rounded-2xl flex flex-col hover:border-[#ffb347]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(255,179,71,0.15)] cursor-pointer h-full p-4 w-full"
                              >

                                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-4 bg-dark-bg-primary/50 relative shadow-lg">
                                  {rec.book.volumeInfo.imageLinks?.thumbnail && <img src={rec.book.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')} alt={rec.book.volumeInfo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                                </div>
                                <h3 className="font-bold text-warm-light text-sm line-clamp-1 mb-1">{rec.book.volumeInfo.title}</h3>
                                <p className="text-warm-beige/50 text-xs italic mb-3 line-clamp-1">{rec.book.volumeInfo.authors?.join(', ')}</p>
                              </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="absolute top-8 right-0 bottom-0 w-20 bg-gradient-to-l from-dark-bg-primary to-transparent pointer-events-none" />
                  </section>
                </div>
              )}

              {/* CATEGORY ROWS */}
              <div className="max-w-[1400px] mx-auto pt-10 space-y-14 pb-8">
                {categories.length > 0 && categories.every(c => c.books.length === 0) && (
                   <div className="text-center text-warm-beige/50 py-32 flex flex-col items-center">
                     <span className="text-4xl mb-4 opacity-50">🚧</span>
                     <p className="text-xl font-bold mb-2 text-warm-light">Google Kitaplar API Sınırına Ulaşıldı</p>
                     <p className="max-w-md text-sm">Çok fazla istek atıldığı için Google geçici olarak erişimi durdurdu. Lütfen 1-2 dakika bekleyip sayfayı yenileyin.</p>
                   </div>
                )}
                
                {categories.map(category => {
                  if (category.books.length === 0) return null;
                  return (
                    <section key={category.id} id={`category-${category.id}`} className="relative group/section">
                      {/* Başlık + Butonlar */}
                      <div className="px-6 md:px-8 mb-4 flex items-center justify-between">
                        <h2
                          onClick={() => openCategoryPage(category)}
                          className="flex items-center gap-2.5 text-lg md:text-xl font-black text-warm-light tracking-tight border-l-[3px] border-warm-beige pl-3.5 cursor-pointer hover:text-warm-beige transition-colors"
                        >
                          <span>{category.title}</span>
                        </h2>
                        <div className="hidden md:flex gap-2">
                          <button
                            onClick={() => scrollRow(category.id, 'left')}
                            className="p-2 rounded-full bg-dark-bg-secondary border border-warm-beige/15 hover:bg-warm-beige/15 hover:border-warm-beige/40 text-warm-beige/70 hover:text-warm-light transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                          </button>
                          <button
                            onClick={() => scrollRow(category.id, 'right')}
                            className="p-2 rounded-full bg-dark-bg-secondary border border-warm-beige/15 hover:bg-warm-beige/15 hover:border-warm-beige/40 text-warm-beige/70 hover:text-warm-light transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Scroll Row */}
                      <div
                        id={`scroll-${category.id}`}
                        className="flex gap-3 overflow-x-auto px-6 md:px-8 pb-6 pt-2 snap-x snap-mandatory"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {category.books.map(book => (
                          <div key={book.id} className="snap-start flex-shrink-0 flex items-stretch">
                            {renderBookCard(book, 'carousel')}
                          </div>
                        ))}
                      </div>

                      {/* Fade edges */}
                      <div className="absolute top-8 right-0 bottom-0 w-20 bg-gradient-to-l from-dark-bg-primary to-transparent pointer-events-none" />
                    </section>
                  );
                })}

              </div>
            </>
          )}
        </div>
      )}

      {/* ── MODAL: KİTABI İNCELE ── */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Arka plan karartması */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedBook(null)}
          />

          {/* Modal İçeriği */}
          <div className="relative w-full max-w-4xl bg-[#1A1A1A] border border-warm-beige/20 rounded-3xl shadow-2xl flex flex-col md:flex-row max-h-full overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Kapat Butonu */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-warm-beige/50 hover:text-warm-light hover:bg-black/80 transition-all backdrop-blur-sm border border-warm-beige/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Sol: Kapak ve Aksiyonlar */}
            <div className="w-full md:w-[280px] lg:w-[340px] bg-dark-bg-secondary p-6 md:p-8 flex flex-col gap-6 shrink-0 border-r border-warm-beige/10 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden bg-dark-bg-primary/50 relative border border-warm-beige/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                {selectedBook.volumeInfo.imageLinks?.thumbnail ? (
                  <img
                    src={selectedBook.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:') + '&fife=w600'}
                    alt={selectedBook.volumeInfo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-warm-beige/20 p-6 text-center">
                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm font-bold">Kapak Görseli Yok</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleAddToLibrary(selectedBook)}
                  disabled={addingBookId === selectedBook.id}
                  className="w-full py-3.5 bg-warm-beige hover:bg-warm-light text-dark-bg-primary font-black tracking-widest uppercase text-[11px] rounded-xl transition-all shadow-[0_0_20px_rgba(218,185,141,0.2)] hover:shadow-[0_0_30px_rgba(218,185,141,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  {addingBookId === selectedBook.id ? 'Ekleniyor...' : 'Kitaplığıma Ekle'}
                </button>
                {selectedBook.volumeInfo.previewLink && (
                  <a
                    href={selectedBook.volumeInfo.previewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-transparent border border-warm-beige/30 hover:bg-warm-beige/10 text-warm-beige font-bold tracking-widest uppercase text-[10px] rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Önizleme
                  </a>
                )}
              </div>
            </div>

            {/* Sağ: Detaylar */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-warm-light leading-tight mb-2">
                  {selectedBook.volumeInfo.title}
                </h2>
                <h3 className="text-lg md:text-xl text-warm-beige/60 italic font-medium">
                  {selectedBook.volumeInfo.authors?.join(', ') || 'Bilinmeyen Yazar'}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:gap-5 mb-8 pb-8 border-b border-warm-beige/10">
                {selectedBook.volumeInfo.averageRating && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warm-beige/10 border border-warm-beige/20 text-warm-light text-sm font-bold">
                    <svg className="w-4 h-4 text-warm-beige" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {selectedBook.volumeInfo.averageRating}
                    <span className="text-warm-beige/40 text-xs font-normal">({selectedBook.volumeInfo.ratingsCount || 0})</span>
                  </div>
                )}
                {selectedBook.volumeInfo.publishedDate && (
                  <div className="flex items-center gap-2 text-sm text-warm-beige/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {selectedBook.volumeInfo.publishedDate.substring(0, 4)}
                  </div>
                )}
                {selectedBook.volumeInfo.pageCount && (
                  <div className="flex items-center gap-2 text-sm text-warm-beige/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    {selectedBook.volumeInfo.pageCount} Sayfa
                  </div>
                )}
                {selectedBook.volumeInfo.publisher && (
                  <div className="flex items-center gap-2 text-sm text-warm-beige/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {selectedBook.volumeInfo.publisher}
                  </div>
                )}
              </div>

              {/* Açıklama */}
              <div className="prose prose-invert prose-p:text-warm-beige/60 prose-p:leading-relaxed prose-a:text-warm-beige hover:prose-a:text-warm-light max-w-none text-sm md:text-base text-justify">
                {selectedBook.volumeInfo.description ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedBook.volumeInfo.description }} />
                ) : (
                  <p className="italic opacity-50">Bu kitap için bir açıklama veya özet bulunamadı.</p>
                )}
              </div>

              {/* Kategoriler */}
              {selectedBook.volumeInfo.categories && selectedBook.volumeInfo.categories.length > 0 && (
                <div className="mt-8 pt-6 border-t border-warm-beige/10 flex flex-wrap gap-2">
                  {selectedBook.volumeInfo.categories.map((cat, i) => (
                    <span key={i} className="px-3 py-1 bg-dark-bg-secondary rounded-full text-xs font-bold tracking-wide text-warm-beige/50 border border-warm-beige/5">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `*::-webkit-scrollbar { display: none; }` }} />
    </main>
  );
}
