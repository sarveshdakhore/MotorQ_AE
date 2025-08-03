import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export enum UserRole {
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN'
}

export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user has required role with fallback to OPERATOR
      const userRole = (req.user.role as UserRole) || UserRole.OPERATOR;
      
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'Access forbidden. Insufficient permissions.'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Convenience middleware functions
export const requireOperator = requireRole([UserRole.OPERATOR, UserRole.ADMIN]);
export const requireAdmin = requireRole([UserRole.ADMIN]);
