import { Response } from 'express';
import { NoteService } from '../services/noteService';
import { AuthRequest } from '../middlewares/auth';

export class NoteController {
  // Get all notes for a user
  static async getAllNotes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const notes = await NoteService.getAllNotes(userId);

      res.json({
        success: true,
        data: notes,
        count: notes.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch all notes',
      });
    }
  }

  // Get notes for a book
  static async getNotes(req: AuthRequest, res: Response) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;

      const notes = await NoteService.getNotes(userId, bookId);

      res.json({
        success: true,
        data: notes,
        count: notes.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notes',
      });
    }
  }

  // Create note
  static async createNote(req: AuthRequest, res: Response) {
    try {
      const { bookId } = req.params;
      const userId = req.user._id;
      const { content, pageNumber } = req.body;

      const note = await NoteService.createNote(userId, bookId, content, pageNumber);

      res.status(201).json({
        success: true,
        data: note,
        message: 'Note created successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to create note',
      });
    }
  }

  // Update note
  static async updateNote(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      const note = await NoteService.updateNote(userId, noteId, updateData);

      if (!note) {
        return res.status(404).json({
          success: false,
          error: 'Note not found',
        });
      }

      res.json({
        success: true,
        data: note,
        message: 'Note updated successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to update note',
      });
    }
  }

  // Delete note
  static async deleteNote(req: AuthRequest, res: Response) {
    try {
      const { noteId } = req.params;
      const userId = req.user._id;

      const deleted = await NoteService.deleteNote(userId, noteId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Note not found',
        });
      }

      res.json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete note',
      });
    }
  }
}