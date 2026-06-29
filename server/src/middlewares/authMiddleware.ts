import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Missing authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // TODO: Verify Firebase token
    // For now, extract userId from token (in production, verify with Firebase)
    (req as any).userId = 'user-placeholder';

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized'
    });
  }
};
