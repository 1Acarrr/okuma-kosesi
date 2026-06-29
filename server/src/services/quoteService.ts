import { Quote, IQuote } from '../models/Quote';

export class QuoteService {
    static async getAllQuotes(userId: string): Promise<IQuote[]> {
        try {
            const quotes = await Quote.find({ userId }).sort({ createdAt: -1 });
            return quotes;
        } catch (error) {
            console.error('Error fetching all quotes:', error);
            throw error;
        }
    }

    static async getQuotesByBook(userId: string, bookId: string): Promise<IQuote[]> {
        try {
            const quotes = await Quote.find({ userId, bookId }).sort({ createdAt: -1 });
            return quotes;
        } catch (error) {
            console.error('Error fetching quotes for book:', error);
            throw error;
        }
    }

    static async createQuote(userId: string, bookId: string, content: string, pageNumber?: number): Promise<IQuote> {
        try {
            const quote = new Quote({
                userId,
                bookId,
                content,
                pageNumber,
            });
            await quote.save();
            return quote;
        } catch (error) {
            console.error('Error creating quote:', error);
            throw error;
        }
    }

    static async updateQuote(userId: string, quoteId: string, updateData: Partial<IQuote>): Promise<IQuote | null> {
        try {
            const quote = await Quote.findOneAndUpdate(
                { _id: quoteId, userId },
                updateData,
                { new: true }
            );
            return quote;
        } catch (error) {
            console.error('Error updating quote:', error);
            throw error;
        }
    }

    static async deleteQuote(userId: string, quoteId: string): Promise<boolean> {
        try {
            const result = await Quote.findOneAndDelete({ _id: quoteId, userId });
            return !!result;
        } catch (error) {
            console.error('Error deleting quote:', error);
            throw error;
        }
    }
}
