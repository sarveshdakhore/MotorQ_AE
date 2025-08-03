import { Request } from 'express';
import { authService } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

export async function expressAuthentication(
  request: AuthenticatedRequest,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    const token = request.cookies?.token || 
                  request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = authService.verifyToken(token);
    if (!decoded) {
      throw new Error('Invalid token');
    }

    // Verify user still exists and get role
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role
    };
  }

  throw new Error('Unknown authentication type');
}
