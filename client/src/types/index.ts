export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages?: number;
  currentPage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  bookId: string;
  content: string;
  pageNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  userId: string;
  bookId: string;
  content: string;
  pageNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  category: 'nature' | 'urban' | 'indoor';
  source: string;
  license: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  durationMinutes: number;
  pagesRead?: number;
  date: string;
}

export interface DailyStats {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  booksRead: number;
}

export interface WeeklyStats {
  week: string;
  totalMinutes: number;
  sessionsCount: number;
  booksRead: number;
  dailyBreakdown: Record<string, number>;
}

export interface ReadingSummary {
  totalBooksRead: number;
  totalReadingMinutes: number;
  totalSessions: number;
  averageSessionDuration: number;
  mostReadBook?: {
    id: string;
    title: string;
    minutes: number;
  };
}
