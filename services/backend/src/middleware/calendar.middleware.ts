import { Request, Response, NextFunction } from 'express';

export const enforceCheckInWindow = (window: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const allowedWindows: Record<string, number[]> = {
      'Q1': [7], // July
      'Q2': [10], // October
      'Q3': [1], // January
      'Q4': [3, 4], // March or April
    };
    
    // Bypass for Hackathon testing purposes if header is provided
    if (req.headers['x-hackathon-bypass']) {
      next();
      return;
    }

    const windowMonths = allowedWindows[window];
    if (!windowMonths || !windowMonths.includes(currentMonth)) {
      res.status(403).json({ 
        message: `System Locked: Check-in for ${window} is restricted to month(s) ${windowMonths?.join(', ')}.` 
      });
      return;
    }
    next();
  };
};
