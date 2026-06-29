import React, { useState, useEffect } from 'react';
import { BookCard } from '../components/BookCard';
import { useAppStore } from '../lib/store';
import apiClient from '../lib/api';
import { Book } from '../types';
import { useRouter } from 'next/router';

export default function BooksPage() {
  const router = useRouter();
  const {
    books, setBooks, addBook, removeBook,
    notes, addNote, setNotes,
    quotes, addQuote, setQuotes,
    isAuthenticated
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', author: '', totalPages: '', coverUrl: '' });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Add Book Modal State
  const [addBookTab, setAddBookTab] = useState<'search' | 'manual'>('search');
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiSearchError, setApiSearchError] = useState('');

  // Detay Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'quotes'>('details');

  // Note/Quote State
  const [newNote, setNewNote] = useState('');
  const [newPageNumber, setNewPageNumber] = useState('');
  const [newQuote, setNewQuote] = useState('');

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      if (isAuthenticated) {
        await Promise.all([fetchBooks(), fetchNotes(), fetchQuotes()]);
        setHasFetched(true);
      }
      setIsLoading(false);
    };
    initData();
  }, [isAuthenticated]);

  const fetchBooks = async () => {
    try {
      const response = await apiClient.get('/books');
      setBooks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await apiClient.get('/notes');
      setNotes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await apiClient.get('/quotes');
      setQuotes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookData = {
        ...formData,
        totalPages: formData.totalPages ? parseInt(formData.totalPages) : undefined
      };
      const response = await apiClient.post('/books', bookData);
      addBook(response.data.data);
      setShowAddForm(false);
      setFormData({ title: '', author: '', totalPages: '', coverUrl: '' });
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Bu kitabı silmek istediğinize emin misiniz? Tüm notlarınız ve alıntılarınız da silinecek.')) return;
    try {
      await apiClient.delete(`/books/${bookId}`);
      removeBook(bookId);
      if (selectedBook?.id === bookId) {
        setIsDetailModalOpen(false);
        setSelectedBook(null);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleUpdatePage = async (page: number) => {
    if (!selectedBook) return;
    try {
      const response = await apiClient.patch(`/books/${selectedBook.id}/progress`, {
        currentPage: page
      });
      const updatedBook = response.data.data;
      
      const newBooks = books.map(b => b.id === updatedBook.id ? updatedBook : b);
      setBooks(newBooks);
      setSelectedBook(updatedBook);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedBook || !newNote.trim()) return;
    try {
      const response = await apiClient.post(`/notes/${selectedBook.id}`, {
        content: newNote,
        pageNumber: newPageNumber ? parseInt(newPageNumber) : undefined
      });
      addNote(response.data.data);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddQuote = async () => {
    if (!selectedBook || !newQuote.trim()) return;
    try {
      const response = await apiClient.post(`/quotes/${selectedBook.id}`, {
        content: newQuote,
        pageNumber: newPageNumber ? parseInt(newPageNumber) : undefined
      });
      addQuote(response.data.data);
      setNewQuote('');
    } catch (error) {
      console.error('Error adding quote:', error);
    }
  };

  const searchGoogleBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiSearchQuery.trim()) return;
    setIsSearchingApi(true);
    setApiSearchError('');
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(apiSearchQuery)}&maxResults=5`);
      const data = await res.json();
      
      if (data.error && data.error.code === 429) {
        console.warn('Google Books API Quota Exceeded. Falling back to OpenLibrary...');
        const fallbackRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(apiSearchQuery)}&limit=5`);
        const fallbackData = await fallbackRes.json();
        
        const transliterateCyrillic = (text: string) => {
          if (!text) return text;
          
          // En bilinen yazarlar için birebir Türkçe karşılıkları
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

        const formattedResults = (fallbackData.docs || []).map((doc: any) => ({
          id: doc.key,
          volumeInfo: {
            title: doc.title,
            authors: doc.author_name ? doc.author_name.map(transliterateCyrillic) : undefined,
            pageCount: doc.number_of_pages_median || '',
            imageLinks: doc.cover_i ? { thumbnail: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` } : null
          }
        }));
        setApiSearchResults(formattedResults);
        setApiSearchError(''); // Yedek devreye girdi, hatayı gizle
      } else if (data.error) {
        setApiSearchError(data.error.message || 'API Hatası');
        setApiSearchResults([]);
      } else {
        setApiSearchResults(data.items || []);
        setApiSearchError('');
      }
    } catch (error) {
      console.error('API search failed:', error);
      setApiSearchError('Arama sırasında bir bağlantı hatası oluştu.');
      setApiSearchResults([]);
    } finally {
      setIsSearchingApi(false);
    }
  };

  const handleSelectApiBook = (item: any) => {
    const info = item.volumeInfo;
    setFormData({
      title: info.title || '',
      author: info.authors ? info.authors.join(', ') : '',
      totalPages: info.pageCount ? String(info.pageCount) : '',
      // Use https to avoid mixed content warnings, and use a slightly larger thumbnail if available
      coverUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || ''
    });
    setAddBookTab('manual');
  };

  const openDetails = (book: Book) => {
    setSelectedBook(book);
    setIsDetailModalOpen(true);
    setActiveTab('details');
  };

  const bookNotes = notes.filter(n => n.bookId === selectedBook?.id);
  const bookQuotes = quotes.filter(q => q.bookId === selectedBook?.id);

  return (
    <main className="min-h-screen bg-dark-bg-primary text-text-light px-6 py-12 font-sans selection:bg-warm-beige/30">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black text-warm-light tracking-tighter mb-2">Kitaplığım</h1>
            <p className="text-warm-beige/40 font-medium tracking-widest uppercase text-xs">Okuma Yolculuğunu Yönet</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Bar */}
            {isAuthenticated && books.length > 0 && (
              <div className="relative w-full sm:w-64 md:w-80">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-warm-beige/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Kitap adı veya yazar ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-dark-bg-secondary/60 border border-warm-beige/10 text-warm-light placeholder:text-warm-beige/20 focus:border-warm-beige/40 focus:bg-dark-bg-secondary focus:outline-none transition-all shadow-lg"
                />
              </div>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                } else {
                  setShowAddForm(true);
                }
              }}
              className="group relative px-6 py-4 bg-dark-bg-secondary hover:bg-warm-beige/10 border border-warm-beige/20 rounded-2xl transition-all duration-300 active:scale-95 w-full sm:w-auto whitespace-nowrap"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-warm-beige/10 flex items-center justify-center text-warm-beige group-hover:bg-warm-beige group-hover:text-dark-bg-primary transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                <span className="font-bold text-warm-beige tracking-wide">Yeni Kitap Ekle</span>
              </div>
            </button>
          </div>
        </div>

        {/* Add Book Form Modal - Overlay Style */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-dark-bg-secondary border border-warm-beige/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
              <div className="p-5 md:p-8 overflow-y-auto">
                <div className="flex justify-between items-center mb-5 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-black text-warm-light tracking-tight">Kitap Kaydet</h2>
                  <button onClick={() => setShowAddForm(false)} className="text-warm-beige/40 hover:text-warm-beige transition-colors p-1">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 md:gap-6 mb-5 md:mb-6 border-b border-warm-beige/10">
                  <button
                    onClick={() => setAddBookTab('search')}
                    className={`pb-2 md:pb-3 text-[10px] md:text-xs uppercase tracking-widest font-black transition-all ${addBookTab === 'search' ? 'text-warm-beige border-b-2 border-warm-beige' : 'text-warm-beige/30 hover:text-warm-beige/60'}`}
                  >
                    Kitap Ara
                  </button>
                  <button
                    onClick={() => setAddBookTab('manual')}
                    className={`pb-2 md:pb-3 text-[10px] md:text-xs uppercase tracking-widest font-black transition-all ${addBookTab === 'manual' ? 'text-warm-beige border-b-2 border-warm-beige' : 'text-warm-beige/30 hover:text-warm-beige/60'}`}
                  >
                    Manuel Ekle
                  </button>
                </div>

                {addBookTab === 'search' ? (
                  <div className="space-y-5 md:space-y-6">
                    <form onSubmit={searchGoogleBooks} className="flex gap-2">
                      <input
                        type="text"
                        value={apiSearchQuery}
                        onChange={(e) => setApiSearchQuery(e.target.value)}
                        placeholder="Kitap adı yazın..."
                        className="flex-1 px-4 py-3 md:px-5 md:py-4 rounded-2xl bg-dark-bg-primary border border-warm-beige/10 text-warm-light text-sm md:text-base placeholder:text-warm-beige/20 focus:border-warm-beige/40 focus:outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={isSearchingApi || !apiSearchQuery.trim()}
                        className="px-4 py-3 md:px-6 md:py-4 bg-warm-beige/10 hover:bg-warm-beige/20 text-warm-beige font-black rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                      >
                        {isSearchingApi ? (
                          <svg className="w-5 h-5 md:w-6 md:h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        ) : (
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        )}
                      </button>
                    </form>

                    <div className="space-y-3">
                      {apiSearchResults.map((item) => {
                        const info = item.volumeInfo;
                        const coverUrl = info.imageLinks?.thumbnail?.replace('http:', 'https:');
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => handleSelectApiBook(item)}
                            className="flex gap-3 md:gap-4 p-2.5 md:p-3 bg-dark-bg-primary/50 hover:bg-dark-bg-primary border border-warm-beige/5 hover:border-warm-beige/20 rounded-2xl cursor-pointer transition-all group items-center"
                          >
                            <div className="w-10 h-14 md:w-12 md:h-16 bg-dark-bg-secondary rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-warm-beige/10">
                              {coverUrl ? (
                                <img src={coverUrl} alt={info.title} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-4 h-4 md:w-5 md:h-5 text-warm-beige/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <h3 className="text-warm-light font-bold text-xs md:text-sm line-clamp-1 group-hover:text-warm-beige transition-colors">{info.title}</h3>
                              <p className="text-warm-beige/50 text-[10px] md:text-xs line-clamp-1 mt-0.5">{info.authors ? info.authors.join(', ') : 'Yazar bilinmiyor'}</p>
                            </div>
                            <div className="flex items-center justify-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-warm-beige" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                          </div>
                        );
                      })}
                      {apiSearchError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                          <p className="text-red-400 text-xs md:text-sm">{apiSearchError}</p>
                          <button onClick={() => setAddBookTab('manual')} className="mt-3 text-[10px] md:text-xs text-warm-beige hover:text-warm-light font-bold uppercase tracking-widest transition-colors">Manuel Ekle</button>
                        </div>
                      )}
                      
                      {apiSearchResults.length === 0 && apiSearchQuery && !isSearchingApi && !apiSearchError && (
                        <div className="text-center py-8 px-4 border border-dashed border-warm-beige/10 rounded-2xl bg-dark-bg-secondary/20">
                          <p className="text-warm-beige/40 text-xs md:text-sm">"{apiSearchQuery}" için sonuç bulunamadı.</p>
                          <button onClick={() => setAddBookTab('manual')} className="mt-3 text-[10px] md:text-xs text-warm-beige hover:text-warm-light font-bold uppercase tracking-widest transition-colors">Manuel Ekle</button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAddBook} className="space-y-6 animate-in fade-in duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] text-warm-beige/40 uppercase tracking-[0.2em] font-bold ml-1">Kitap Başlığı</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="w-full px-5 py-4 rounded-2xl bg-dark-bg-primary border border-warm-beige/10 text-warm-light placeholder:text-warm-beige/20 focus:border-warm-beige/40 focus:outline-none transition-all"
                        placeholder=""
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-warm-beige/40 uppercase tracking-[0.2em] font-bold ml-1">Yazar</label>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                          required
                          className="w-full px-5 py-4 rounded-2xl bg-dark-bg-primary border border-warm-beige/10 text-warm-light placeholder:text-warm-beige/20 focus:border-warm-beige/40 focus:outline-none transition-all"
                          placeholder=""
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-warm-beige/40 uppercase tracking-[0.2em] font-bold ml-1">Toplam Sayfa</label>
                        <input
                          type="number"
                          value={formData.totalPages}
                          onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
                          className="w-full px-5 py-4 rounded-2xl bg-dark-bg-primary border border-warm-beige/10 text-warm-light placeholder:text-warm-beige/20 focus:border-warm-beige/40 focus:outline-none transition-all"
                          placeholder=""
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-warm-beige/40 uppercase tracking-[0.2em] font-bold ml-1">Kapak Görseli URL (Opsiyonel)</label>
                      <input
                        type="url"
                        value={formData.coverUrl}
                        onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl bg-dark-bg-primary border border-warm-beige/10 text-warm-light placeholder:text-warm-beige/20 focus:border-warm-beige/40 focus:outline-none transition-all"
                        placeholder="https://..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-warm-beige hover:bg-warm-light text-dark-bg-primary font-black rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-warm-beige/10 mt-4"
                    >
                      Koleksiyona Ekle
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {!isAuthenticated ? (
          <div className="text-center py-32 bg-dark-bg-secondary/20 border-2 border-dashed border-warm-beige/10 rounded-[40px]">
            <div className="w-24 h-24 mx-auto mb-6 bg-warm-beige/5 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-warm-beige/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-warm-light text-xl font-bold mb-4">Kitaplığınız Kilitli</p>
            <p className="text-warm-beige/60 mb-8 max-w-md mx-auto">Okuma geçmişinizi, notlarınızı ve alıntılarınızı görmek için lütfen giriş yapın.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-10 py-4 bg-warm-beige hover:bg-warm-light text-dark-bg-primary font-black rounded-2xl transition-all shadow-lg shadow-warm-beige/10"
            >
              Giriş Yap
            </button>
          </div>
        ) : (isLoading || !hasFetched) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-warm-beige/20 border-t-warm-beige rounded-full animate-spin"></div>
            <p className="text-warm-beige/40 font-bold uppercase tracking-widest text-[10px]">Kitaplar Tozlanıyor...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-32 bg-dark-bg-secondary/20 border-2 border-dashed border-warm-beige/10 rounded-[40px]">
            <div className="w-24 h-24 mx-auto mb-6 bg-warm-beige/5 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-warm-beige/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-warm-light text-xl font-bold mb-8">Henüz bir hikaye başlatmadınız.</p>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  router.push('/login');
                } else {
                  setShowAddForm(true);
                }
              }}
              className="px-10 py-4 bg-warm-beige/5 hover:bg-warm-beige/10 border border-warm-beige/20 text-warm-beige font-black rounded-2xl transition-all"
            >
              İlk Kitabınızı Tanımlayın
            </button>
          </div>
        ) : (
          (() => {
            const filteredBooks = books.filter(b => 
              b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              b.author.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (filteredBooks.length === 0 && searchQuery) {
              return (
                <div className="text-center py-20 bg-dark-bg-secondary/20 border border-warm-beige/5 rounded-[32px]">
                  <p className="text-warm-beige/60 text-lg">"{searchQuery}" ile eşleşen bir kitap bulunamadı.</p>
                </div>
              );
            }

            const totalPagesCount = Math.ceil(filteredBooks.length / itemsPerPage);
            const currentBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

            return (
              <div className="flex flex-col">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {currentBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={openDetails}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>

                {/* Pagination UI */}
                {totalPagesCount > 1 && (
                  <div className="flex flex-col items-center mt-12 mb-4 gap-4 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-bg-secondary border border-warm-beige/10 text-warm-beige/40 hover:text-warm-beige hover:border-warm-beige/30 transition-all disabled:opacity-30 disabled:hover:border-warm-beige/10"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>

                      {Array.from({ length: totalPagesCount }, (_, i) => i + 1).map(page => {
                        if (page === 1 || page === totalPagesCount || Math.abs(page - currentPage) <= 1) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === page ? 'bg-warm-beige text-dark-bg-primary shadow-[0_0_15px_rgba(218,165,105,0.4)]' : 'bg-dark-bg-secondary border border-warm-beige/10 text-warm-beige/60 hover:text-warm-beige hover:border-warm-beige/30'}`}
                            >
                              {page}
                            </button>
                          )
                        }
                        if (page === 2 && currentPage > 3) return <span key="ellipsis1" className="text-warm-beige/40 px-1">...</span>;
                        if (page === totalPagesCount - 1 && currentPage < totalPagesCount - 2) return <span key="ellipsis2" className="text-warm-beige/40 px-1">...</span>;
                        return null;
                      })}

                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPagesCount, p + 1))}
                        disabled={currentPage === totalPagesCount}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-dark-bg-secondary border border-warm-beige/10 text-warm-beige/40 hover:text-warm-beige hover:border-warm-beige/30 transition-all disabled:opacity-30 disabled:hover:border-warm-beige/10"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    <p className="text-xs font-bold text-warm-beige/40 tracking-widest">Sayfa {currentPage} / {totalPagesCount}</p>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Book Detail Modal - NEW Feature Section */}
        {isDetailModalOpen && selectedBook && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="bg-dark-bg-secondary border border-warm-beige/20 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)] relative">
              {/* Close Button Top Right */}
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-6 right-8 z-[70] p-2 text-warm-beige/40 hover:text-warm-beige transition-colors hover:bg-white/5 rounded-full"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Left Side: Cover & Status */}
              <div className="w-full md:w-80 bg-dark-bg-primary p-6 md:p-8 flex flex-col items-center overflow-y-auto md:border-r border-warm-beige/10">
                <div className="w-32 h-48 md:w-48 md:h-72 rounded-2xl shadow-2xl overflow-hidden mb-4 md:mb-6 border border-warm-beige/10 flex-shrink-0">
                  {selectedBook.coverUrl ? (
                    <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-dark-bg-secondary flex items-center justify-center">
                      <svg className="w-10 h-10 md:w-16 md:h-16 text-warm-beige/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                  )}
                </div>
                <h2 className="text-warm-light text-xl md:text-2xl font-black text-center mb-1 px-4">{selectedBook.title}</h2>
                <p className="text-warm-beige/40 italic text-xs md:text-sm mb-6 md:mb-8">{selectedBook.author}</p>

                <div className="w-full space-y-4">
                  <div className="p-4 bg-dark-bg-secondary rounded-2xl border border-warm-beige/5">
                    <label className="text-[10px] text-warm-beige/30 uppercase font-black mb-2 block tracking-widest text-center md:text-left">Şu Anki Sayfa</label>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <input
                        type="number"
                        min="0"
                        max={selectedBook.totalPages}
                        defaultValue={selectedBook.currentPage}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 0) {
                            handleUpdatePage(val);
                          } else {
                            e.target.value = (selectedBook.currentPage || 0).toString();
                          }
                        }}
                        className="w-16 md:w-20 bg-dark-bg-primary border border-warm-beige/20 rounded-lg px-2 py-1 text-center font-bold text-warm-beige focus:border-warm-beige/60 outline-none transition-all"
                      />
                      <span className="text-warm-beige/20">/</span>
                      <span className="font-bold text-warm-beige/60">{selectedBook.totalPages}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="hidden md:block w-full py-4 text-[10px] uppercase font-black tracking-widest text-warm-beige/40 hover:text-warm-beige transition-colors"
                  >
                    Kapat
                  </button>
                </div>
              </div>

              {/* Right Side: Tabs & Content */}
              <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden">
                <div className="flex gap-4 md:gap-8 mb-6 md:mb-8 border-b border-warm-beige/10 overflow-x-auto scrollbar-hide shrink-0 pb-1">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 md:pb-4 text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] font-black transition-all whitespace-nowrap ${activeTab === 'details' ? 'text-warm-beige border-b-2 border-warm-beige' : 'text-warm-beige/30'}`}
                  >
                    Genel Durum
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-2 md:pb-4 text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] font-black transition-all whitespace-nowrap ${activeTab === 'notes' ? 'text-warm-beige border-b-2 border-warm-beige' : 'text-warm-beige/30'}`}
                  >
                    Notlarım ({bookNotes.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className={`pb-2 md:pb-4 text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] font-black transition-all whitespace-nowrap ${activeTab === 'quotes' ? 'text-warm-beige border-b-2 border-warm-beige' : 'text-warm-beige/30'}`}
                  >
                    Alıntılar ({bookQuotes.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide pb-8">
                  {activeTab === 'details' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <section>
                        <h4 className="text-warm-beige text-xs font-black uppercase tracking-widest mb-4">Okuma İlerlemesi</h4>
                        <div className="w-full h-4 bg-dark-bg-primary rounded-full overflow-hidden p-1 border border-warm-beige/5">
                          <div
                            className="h-full bg-gradient-to-r from-warm-beige/40 to-warm-beige rounded-full transition-all duration-1000"
                            style={{ width: `${(selectedBook.currentPage || 0) / (selectedBook.totalPages || 1) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] text-warm-beige/30 uppercase font-black">Başlangıç</span>
                          <span className="text-[10px] text-warm-beige/30 uppercase font-black">Hedef</span>
                        </div>
                        <p className="mt-8 text-warm-beige/60 text-lg leading-relaxed italic font-serif border-l-2 border-warm-beige/20 pl-6 py-2">
                          {bookQuotes.length > 0
                            ? `"${bookQuotes[0].content}"`
                            : "Bir kitap okumak, başka bir zihinle sessiz bir sohbete başlamaktır."}
                        </p>
                      </section>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-4 p-6 bg-dark-bg-primary rounded-3xl border border-warm-beige/5">
                        <textarea
                          placeholder="Yeni bir düşünce kaydet..."
                          className="w-full h-32 bg-transparent text-warm-light placeholder:text-warm-beige/20 focus:outline-none transition-all resize-none text-sm leading-relaxed"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                        />
                        <div className="flex justify-between items-center pt-4 border-t border-warm-beige/5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-warm-beige/30 uppercase font-bold">Sayfa:</span>
                            <input
                              type="number"
                              placeholder="--"
                              className="w-16 bg-dark-bg-secondary border border-warm-beige/10 rounded-lg px-2 py-1 text-xs text-warm-beige focus:outline-none focus:border-warm-beige/40 text-center"
                              value={newPageNumber}
                              onChange={(e) => setNewPageNumber(e.target.value)}
                            />
                          </div>
                          <button
                            className="px-8 py-3 bg-warm-beige text-dark-bg-primary font-black text-[10px] uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95"
                            onClick={handleAddNote}
                          >
                            Notu Sakla
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {bookNotes.map(note => (
                          <div key={note.id} className="p-6 bg-dark-bg-primary/40 border border-warm-beige/5 rounded-3xl hover:border-warm-beige/20 transition-all group">
                            <div className="flex justify-between mb-4">
                              <div className="px-3 py-1 bg-warm-beige/5 rounded-full">
                                <span className="text-[9px] text-warm-beige/40 uppercase font-black tracking-widest">Sayfa {note.pageNumber || '??'}</span>
                              </div>
                              <span className="text-[9px] text-warm-beige/20 uppercase font-black tracking-widest">{new Date(note.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <p className="text-sm text-warm-beige/70 leading-relaxed">{note.content}</p>
                          </div>
                        ))}
                        {bookNotes.length === 0 && (
                          <p className="text-center py-12 text-warm-beige/20 text-xs italic tracking-widest">Henüz bir not bırakılmamış.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'quotes' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-4 p-6 bg-dark-bg-primary rounded-3xl border border-warm-beige/5">
                        <textarea
                          placeholder="Altı çizili o cümleyi buraya fısılda..."
                          className="w-full h-32 bg-transparent text-warm-light placeholder:text-warm-beige/20 focus:outline-none transition-all resize-none italic font-serif text-lg text-center flex items-center justify-center p-8"
                          value={newQuote}
                          onChange={(e) => setNewQuote(e.target.value)}
                        />
                        <button
                          className="w-full py-4 bg-warm-beige/10 hover:bg-warm-beige text-warm-beige hover:text-dark-bg-primary font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
                          onClick={handleAddQuote}
                        >
                          Alıntıyı Ebedileştir
                        </button>
                      </div>

                      <div className="space-y-6">
                        {bookQuotes.map(quote => (
                          <div key={quote.id} className="relative p-8 bg-dark-bg-primary/20 border-l border-warm-beige/10 rounded-r-[40px] group hover:bg-warm-beige/[0.02] transition-all">
                            <div className="absolute -left-0.5 top-0 bottom-0 w-1 bg-warm-beige/20 rounded-full group-hover:bg-warm-beige transition-all"></div>
                            <p className="italic font-serif text-lg text-warm-beige/80 leading-relaxed mb-4">"{quote.content}"</p>
                            <div className="flex justify-end">
                              <span className="text-[8px] text-warm-beige/20 uppercase font-black tracking-[0.3em]">{new Date(quote.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                        ))}
                        {bookQuotes.length === 0 && (
                          <p className="text-center py-12 text-warm-beige/20 text-xs italic tracking-widest">Kütüphaneniz sessiz, henüz bir alıntı yok.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
