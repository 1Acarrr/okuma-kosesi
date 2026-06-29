import { Book, IBook } from '../models/Book';
import { ReadingSession, IReadingSession } from '../models/ReadingSession';

export class BookService {
  static async getBooks(userId: string): Promise<IBook[]> {
    try {
      const books = await Book.find({ userId }).sort({ updatedAt: -1 });
      return books;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  static async getBook(userId: string, bookId: string): Promise<IBook | null> {
    try {
      const book = await Book.findOne({ _id: bookId, userId });
      return book;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  static async createBook(userId: string, bookData: Partial<IBook>): Promise<IBook> {
    try {
      const book = new Book({
        ...bookData,
        userId,
      });
      await book.save();
      return book;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }

  static async updateBook(userId: string, bookId: string, bookData: Partial<IBook>): Promise<IBook | null> {
    try {
      const book = await Book.findOneAndUpdate(
        { _id: bookId, userId },
        bookData,
        { new: true }
      );
      return book;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  static async deleteBook(userId: string, bookId: string): Promise<boolean> {
    try {
      const result = await Book.findOneAndDelete({ _id: bookId, userId });
      return !!result;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }

  static async addReadingSession(
    userId: string,
    bookId: string,
    sessionData: { durationMinutes: number; pagesRead?: number }
  ): Promise<IReadingSession> {
    try {
      const session = new ReadingSession({
        ...sessionData,
        userId,
        bookId,
        date: new Date(),
      });
      await session.save();
      return session;
    } catch (error) {
      console.error('Error adding reading session:', error);
      throw error;
    }
  }

  static async getReadingSessions(userId: string, bookId: string): Promise<IReadingSession[]> {
    try {
      const sessions = await ReadingSession.find({ userId, bookId }).sort({ date: -1 });
      return sessions;
    } catch (error) {
      console.error('Error fetching reading sessions:', error);
      throw error;
    }
  }
}