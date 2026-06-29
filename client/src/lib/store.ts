import { create } from 'zustand';
import { Book, Note, Quote, AmbientSound } from '../types/index';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AppStore {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  setAuth: (authenticated: boolean, user?: User, token?: string) => void;
  logout: () => void;

  // Books
  books: Book[];
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;

  // Current Book
  currentBook: Book | null;
  setCurrentBook: (book: Book | null) => void;

  // Current Sound
  currentSound: AmbientSound | null;
  setCurrentSound: (sound: AmbientSound | null) => void;

  // Focus Mode
  isFocusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  timerMinutes: number;
  setTimerMinutes: (minutes: number) => void;
  isTimerRunning: boolean;
  setTimerRunning: (running: boolean) => void;

  // Notes
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  removeNote: (noteId: string) => void;

  // Quotes
  quotes: Quote[];
  setQuotes: (quotes: Quote[]) => void;
  addQuote: (quote: Quote) => void;
  removeQuote: (quoteId: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Auth
  isAuthenticated: false,
  user: null,
  token: null,
  setAuth: (authenticated, user, token) =>
    set({ isAuthenticated: authenticated, user: user || null, token: token || null }),
  logout: () =>
    set({ isAuthenticated: false, user: null, token: null }),

  // Books
  books: [],
  setBooks: (books) => set({ books }),
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  removeBook: (bookId) =>
    set((state) => ({
      books: state.books.filter((b) => b.id !== bookId),
    })),

  // Current Book
  currentBook: null,
  setCurrentBook: (book) => set({ currentBook: book }),

  // Current Sound
  currentSound: null,
  setCurrentSound: (sound) => set({ currentSound: sound }),

  // Focus Mode
  isFocusMode: false,
  setFocusMode: (enabled) => set({ isFocusMode: enabled }),
  timerMinutes: 25,
  setTimerMinutes: (minutes) => set({ timerMinutes: minutes }),
  isTimerRunning: false,
  setTimerRunning: (running) => set({ isTimerRunning: running }),

  // Notes
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  removeNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== noteId),
    })),

  // Quotes
  quotes: [],
  setQuotes: (quotes) => set({ quotes }),
  addQuote: (quote) => set((state) => ({ quotes: [...state.quotes, quote] })),
  removeQuote: (quoteId) =>
    set((state) => ({
      quotes: state.quotes.filter((q) => q.id !== quoteId),
    })),
}));
