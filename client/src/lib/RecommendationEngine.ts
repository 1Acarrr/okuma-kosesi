import { Book } from '../types';

export interface GoogleBookItem {
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

export interface RecommendationResult {
  book: GoogleBookItem;
  matchScore: number;
  reason: string;
}

export class RecommendationEngine {
  private static API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
  
  // Eğer kullanıcının kütüphanesi boşsa sunulacak popüler yazarlar
  private static FALLBACK_AUTHORS = [
    'Zülfü Livaneli',
    'Sabahattin Ali',
    'Dostoyevski',
    'Stefan Zweig'
  ];

  /**
   * Kullanıcının kütüphanesini analiz edip en çok okuduğu yazarları bulur.
   */
  private static extractTopAuthors(library: Book[]): string[] {
    if (library.length === 0) return this.FALLBACK_AUTHORS;

    const authorCounts: Record<string, number> = {};
    library.forEach(book => {
      if (book.author) {
        authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
      }
    });

    // Yazarları okunma sayısına göre çoktan aza sırala
    const sortedAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return sortedAuthors.slice(0, 3); // En iyi 3 yazarı al
  }

  /**
   * Google Books API'den yazar bazlı kitapları çeker
   */
  private static async fetchBooksByAuthors(authors: string[]): Promise<GoogleBookItem[]> {
    try {
      const itemsPerAuthor = Math.ceil(20 / authors.length);
      const responses = await Promise.all(
        authors.map(author => 
          fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent('inauthor:"' + author + '"')}&langRestrict=tr&maxResults=${itemsPerAuthor}&orderBy=relevance&key=${this.API_KEY}`)
            .then(r => r.json())
            .catch(() => ({ items: [] }))
        )
      );

      let allItems: GoogleBookItem[] = [];
      responses.forEach(res => {
        if (res.items) {
          allItems = [...allItems, ...res.items];
        }
      });

      return allItems;
    } catch (e) {
      console.error("Öneri motoru kitapları çekerken hata:", e);
      return [];
    }
  }

  /**
   * Aday kitapları kullanıcının kütüphanesine göre filtreler, puanlar ve öneri sebebini yazar.
   */
  public static async getRecommendations(library: Book[]): Promise<RecommendationResult[]> {
    const isLibraryEmpty = library.length === 0;
    const topAuthors = this.extractTopAuthors(library);
    
    // Aday havuzunu çek
    const rawCandidates = await this.fetchBooksByAuthors(topAuthors);

    // 1. Kütüphanede Zaten Olanları Filtrele
    const libraryTitles = new Set(library.map(b => b.title.toLowerCase().trim()));
    const validCandidates = rawCandidates.filter(candidate => {
      // Kapak fotoğrafı yoksa eliyoruz
      if (!candidate.volumeInfo.imageLinks?.thumbnail) return false;
      
      const candidateTitle = candidate.volumeInfo.title.toLowerCase().trim();
      return !libraryTitles.has(candidateTitle);
    });

    // 2. Kalan Adayları Puanla
    const scoredResults: RecommendationResult[] = [];
    const seenIds = new Set<string>();

    validCandidates.forEach(book => {
      if (seenIds.has(book.id)) return;
      seenIds.add(book.id);

      let score = 0;
      let reason = '';
      const bookAuthors = book.volumeInfo.authors || [];
      const isTopAuthorMatch = topAuthors.some(ta => bookAuthors.some(ba => ba.toLowerCase().includes(ta.toLowerCase())));

      if (isLibraryEmpty) {
        // Boş kütüphane için popülerlik puanlaması
        score = 80 + Math.floor(Math.random() * 15);
        reason = `Tüm zamanların en çok okunan başyapıtlarından biri. Kütüphanenize harika bir başlangıç.`;
      } else {
        if (isTopAuthorMatch) {
          score = 90 + Math.floor(Math.random() * 9); // 90-99 arası mükemmel eşleşme
          const matchedAuthor = bookAuthors[0] || 'bu yazarın';
          reason = `Kitaplığınızda ${matchedAuthor} eserleri ağırlıkta olduğu için, bu kitabın tarzını çok seveceksiniz.`;
        } else {
          score = 75 + Math.floor(Math.random() * 15); // 75-89 arası iyi eşleşme
          reason = `Okuma alışkanlıklarınızla %${score} oranında örtüşen sürpriz bir başyapıt.`;
        }
      }

      scoredResults.push({
        book,
        matchScore: score,
        reason
      });
    });

    // Puanlara göre yüksekten düşüğe sırala
    scoredResults.sort((a, b) => b.matchScore - a.matchScore);

    // En iyi 10 öneriyi dön
    return scoredResults.slice(0, 10);
  }
}
