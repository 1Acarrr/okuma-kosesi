import { Response } from 'express';
import { StatsService } from '../services/statsService';
import { AuthRequest } from '../middlewares/auth';

export class StatsController {
  // Get daily stats
  static async getDailyStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { date } = req.query;

      const selectedDate = date ? new Date(date as string) : new Date();
      const dailyStats = await StatsService.getDailyStats(userId, selectedDate);

      res.json({
        success: true,
        data: dailyStats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch daily stats',
      });
    }
  }

  // Get weekly stats
  static async getWeeklyStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { date } = req.query;

      const selectedDate = date ? new Date(date as string) : new Date();
      const weeklyStats = await StatsService.getWeeklyStats(userId, selectedDate);

      res.json({
        success: true,
        data: weeklyStats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch weekly stats',
      });
    }
  }

  // Get yearly heatmap stats
  static async getYearlyStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const yearParam = req.query.year as string;
      const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

      const yearlyStats = await StatsService.getYearlyStats(userId, year);

      res.json({
        success: true,
        data: yearlyStats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch yearly stats',
      });
    }
  }

  // Get reading summary
  static async getReadingSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;

      const summary = await StatsService.getReadingSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch reading summary',
      });
    }
  }

  // Log focus session (without book)
  static async logFocusSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { durationMinutes, isInfinite } = req.body;

      const session = await StatsService.addFocusSession(userId, {
        durationMinutes: durationMinutes || 1,
        isInfinite: isInfinite || false,
      });

      res.status(201).json({
        success: true,
        data: session,
        message: 'Focus session logged successfully',
      });
    } catch (error) {
      console.error('Error logging focus session:', error);
      res.status(400).json({
        success: false,
        error: 'Failed to log focus session',
      });
    }
  }
}