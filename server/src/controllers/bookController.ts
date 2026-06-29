import { Response } from 'express';
import { BookService } from '../services/bookService';
import { AuthRequest } from '../middlewares/auth';

export class BookController {
  // Get all books for user
  static async getBooks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const books = await BookService.getBooks(userId);

      res.json({
        success: true,
        data: books,
        count: books.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch books'
      });
    }
  }

  // Get single book
  static async getBook(req: AuthRequest, res: Response) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;

      const book = await BookService.getBook(userId, bookId);

      if (!book) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }

      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch book'
      });
    }
  }

  // Create new book
  static async createBook(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { title, author, coverUrl, totalPages } = req.body;

      const newBook = await BookService.createBook(userId, {
        title,
        author,
        coverUrl,
        totalPages,
      });

      res.status(201).json({
        success: true,
        data: newBook,
        message: 'Book created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to create book'
      });
    }
  }

  // Update book
  static async updateBook(req: AuthRequest, res: Response) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      const updatedBook = await BookService.updateBook(userId, bookId, updateData);

      if (!updatedBook) {
        return res.status(404).json({
          success: false,
          error: 'Book not found'
        });
      }

      res.json({
        success: true,
        data: updatedBook,
        message: 'Book updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to update book'
      });
    }
  }

  // Delete book
  static async deleteBook(req: AuthRequest, res: Response) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;

      await BookService.deleteBook(userId, bookId);

      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete book'
      });
    }
  }

  // Log reading session
  static async logReadingSession(req: AuthRequest, res: Response) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;
      const { durationMinutes, pagesRead } = req.body;

      const session = await BookService.addReadingSession(
        userId,
        bookId,
        { durationMinutes, pagesRead }
      );

      res.status(201).json({
        success: true,
        data: session,
        message: 'Reading session logged successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to log reading session'
      });
    }
  }
}
