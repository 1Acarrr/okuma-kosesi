import { Note, INote } from '../models/Note';

export class NoteService {
  static async getAllNotes(userId: string): Promise<INote[]> {
    try {
      const notes = await Note.find({ userId }).sort({ createdAt: -1 });
      return notes;
    } catch (error) {
      console.error('Error fetching all notes:', error);
      throw error;
    }
  }

  static async getNotes(userId: string, bookId: string): Promise<INote[]> {
    try {
      const notes = await Note.find({ userId, bookId }).sort({ createdAt: -1 });
      return notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  static async createNote(userId: string, bookId: string, content: string, pageNumber?: number): Promise<INote> {
    try {
      const note = new Note({
        userId,
        bookId,
        content,
        pageNumber,
      });
      await note.save();
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  static async updateNote(userId: string, noteId: string, updateData: Partial<INote>): Promise<INote | null> {
    try {
      const note = await Note.findOneAndUpdate(
        { _id: noteId, userId },
        updateData,
        { new: true }
      );
      return note;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  static async deleteNote(userId: string, noteId: string): Promise<boolean> {
    try {
      const result = await Note.findOneAndDelete({ _id: noteId, userId });
      return !!result;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
}