import { ReadingSession, IReadingSession } from '../models/ReadingSession';
import { Book } from '../models/Book';

// Returns "YYYY-MM-DD" in the server's local timezone
const toLocalDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export interface DailyStats {
  date: Date;
  totalMinutes: number;
  sessionsCount: number;
  booksRead: number;
}

export interface WeeklyStats {
  week: number;
  year: number;
  totalMinutes: number;
  sessionsCount: number;
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

export class StatsService {
  static async getDailyStats(userId: string, date: Date): Promise<DailyStats> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const sessions = await ReadingSession.find({
        userId,
        date: { $gte: startOfDay, $lt: endOfDay },
      });

      const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
      const sessionsCount = sessions.length;

      const books = await Book.find({ userId });
      const booksRead = books.length;

      return {
        date,
        totalMinutes,
        sessionsCount,
        booksRead,
      };
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      throw error;
    }
  }

  static async getWeeklyStats(userId: string, date: Date): Promise<WeeklyStats> {
    try {
      // Monday-first week (matches the UI which shows Mon–Sun)
      const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - diffToMonday);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const sessions = await ReadingSession.find({
        userId,
        date: { $gte: startOfWeek, $lt: endOfWeek },
      });

      const dailyBreakdown: Record<string, number> = {};
      const totalMinutes = sessions.reduce((sum, session) => {
        const dateStr = toLocalDateStr(new Date(session.date));
        dailyBreakdown[dateStr] = (dailyBreakdown[dateStr] || 0) + session.durationMinutes;
        return sum + session.durationMinutes;
      }, 0);

      return {
        week: Math.ceil((date.getDate() - diffToMonday) / 7),
        year: date.getFullYear(),
        totalMinutes,
        sessionsCount: sessions.length,
        dailyBreakdown,
      };
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      throw error;
    }
  }

  static async getYearlyStats(userId: string, year: number): Promise<{ heatmapData: Record<string, number>, availableYears: number[] }> {
    try {
      // Find the earliest session to determine available years
      const earliestSession = await ReadingSession.findOne({ userId }).sort({ date: 1 }).select('date');
      const startYear = earliestSession ? new Date(earliestSession.date).getFullYear() : new Date().getFullYear();
      const currentYear = new Date().getFullYear();
      
      const availableYears = [];
      for (let y = currentYear; y >= startYear; y--) {
        availableYears.push(y);
      }

      // Date range for the requested year
      const startDate = new Date(year, 0, 1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(year, 11, 31);
      endDate.setHours(23, 59, 59, 999);

      const sessions = await ReadingSession.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      });

      const heatmapData: Record<string, number> = {};
      sessions.forEach((session) => {
        const dateStr = toLocalDateStr(new Date(session.date));
        heatmapData[dateStr] = (heatmapData[dateStr] || 0) + session.durationMinutes;
      });

      return { heatmapData, availableYears };
    } catch (error) {
      console.error('Error fetching yearly stats:', error);
      throw error;
    }
  }

  static async getReadingSummary(userId: string): Promise<ReadingSummary> {
    try {
      const sessions = await ReadingSession.find({ userId });
      const books = await Book.find({ userId });

      const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
      const totalSessions = sessions.length;
      const averageSessionDuration = totalSessions > 0 ? totalMinutes / totalSessions : 0;

      // Find most read book (only sessions with bookId)
      const bookStats: Record<string, number> = {};
      sessions.forEach((session) => {
        if (session.bookId) {
          const bookId = session.bookId.toString();
          bookStats[bookId] = (bookStats[bookId] || 0) + session.durationMinutes;
        }
      });

      let mostReadBook;
      if (Object.keys(bookStats).length > 0) {
        const mostReadBookId = Object.keys(bookStats).reduce((a, b) =>
          bookStats[a] > bookStats[b] ? a : b
        );
        const book = books.find((b) => b._id.toString() === mostReadBookId);
        if (book) {
          mostReadBook = {
            id: book._id.toString(),
            title: book.title,
            minutes: bookStats[mostReadBookId],
          };
        }
      }

      return {
        totalBooksRead: books.length,
        totalReadingMinutes: totalMinutes,
        totalSessions,
        averageSessionDuration: Math.round(averageSessionDuration),
        mostReadBook,
      };
    } catch (error) {
      console.error('Error fetching reading summary:', error);
      throw error;
    }
  }

  static async addFocusSession(
    userId: string,
    data: { durationMinutes: number; isInfinite: boolean }
  ): Promise<IReadingSession> {
    try {
      const session = new ReadingSession({
        userId,
        bookId: null, // Focus session için bookId yok
        durationMinutes: data.durationMinutes,
        date: new Date(),
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('Error adding focus session:', error);
      throw error;
    }
  }
}