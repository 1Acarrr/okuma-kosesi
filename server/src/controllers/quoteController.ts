import { Response } from 'express';
import { QuoteService } from '../services/quoteService';
import { AuthRequest } from '../middlewares/auth';

export class QuoteController {
    // Get all quotes for current user
    static async getAllQuotes(req: AuthRequest, res: Response) {
        try {
            const userId = req.user._id;
            const quotes = await QuoteService.getAllQuotes(userId);

            res.json({
                success: true,
                data: quotes,
                count: quotes.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch all quotes',
            });
        }
    }

    // Get quotes for a specific book
    static async getQuotesByBook(req: AuthRequest, res: Response) {
        try {
            const { bookId } = req.params;
            const userId = req.user._id;

            const quotes = await QuoteService.getQuotesByBook(userId, bookId);

            res.json({
                success: true,
                data: quotes,
                count: quotes.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch quotes for book',
            });
        }
    }

    // Create quote
    static async createQuote(req: AuthRequest, res: Response) {
        try {
            const { bookId } = req.params;
            const userId = req.user._id;
            const { content, pageNumber } = req.body;

            const quote = await QuoteService.createQuote(userId, bookId, content, pageNumber);

            res.status(201).json({
                success: true,
                data: quote,
                message: 'Quote created successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: 'Failed to create quote',
            });
        }
    }

    // Update quote
    static async updateQuote(req: AuthRequest, res: Response) {
        try {
            const { quoteId } = req.params;
            const userId = req.user._id;
            const updateData = req.body;

            const quote = await QuoteService.updateQuote(userId, quoteId, updateData);

            if (!quote) {
                return res.status(404).json({
                    success: false,
                    error: 'Quote not found',
                });
            }

            res.json({
                success: true,
                data: quote,
                message: 'Quote updated successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: 'Failed to update quote',
            });
        }
    }

    // Delete quote
    static async deleteQuote(req: AuthRequest, res: Response) {
        try {
            const { quoteId } = req.params;
            const userId = req.user._id;

            const deleted = await QuoteService.deleteQuote(userId, quoteId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Quote not found',
                });
            }

            res.json({
                success: true,
                message: 'Quote deleted successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to delete quote',
            });
        }
    }
}
