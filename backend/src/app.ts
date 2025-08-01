import express from 'express';
import http from 'http';
import cors from 'cors';
// import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { RegisterRoutes } from './routes/routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
// import { otpRateLimit, authRateLimit } from './middleware/rateLimitMiddleware';
import { authMiddleware, AuthRequest } from './middleware/authMiddleware';
import { setupDocumentation, protectDocumentation } from './middleware/documentation';

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8001;

export { app };

// Setup documentation BEFORE security middleware
setupDocumentation(app);

// Security middleware disabled for now
// app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware with error handling
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// JSON parsing error handler (must be after express.json())
app.use((err: any, req: any, res: any, next: any): void => {
  if (err instanceof SyntaxError && 'body' in err && err.message.includes('JSON')) {
    res.status(400).json({ error: 'Invalid JSON', message: 'Request body contains malformed JSON' });
    return;
  }
  next(err);
});

// Documentation protection middleware (blocks /docs in production unless enabled)
app.use(protectDocumentation());

// Rate limiting disabled for development
// app.use('/api/auth/send-register-otp', otpRateLimit);
// app.use('/api/auth/send-login-otp', otpRateLimit);
// app.use('/api/auth', authRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Set API basePath
const basePath = "/api";

// Custom auth routes with cookie handling
app.post('/api/auth/verify-register-otp', async (req, res) => {
  try {
    const { AuthController } = await import('./controllers/AuthController');
    const controller = new AuthController();
    const result = await controller.verifyRegisterOTP(req.body);
    
    if (result.success && result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/verify-login-otp', async (req, res) => {
  try {
    const { AuthController } = await import('./controllers/AuthController');
    const controller = new AuthController();
    const result = await controller.verifyLoginOTP(req.body);
    
    if (result.success && result.token) {
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { authService } = await import('./services/authService');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const user = await authService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User information retrieved successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Mount API routes with the proper base path
app.use(basePath, (req, res, next) => {
  // Initialize routes within the basePath
  next();
});

// Register tsoa routes
RegisterRoutes(app);

// Root route
app.get("/", (req, res): void => {
  res.send("Hello from the backend!");
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Global error handler
app.use((err: any, req: any, res: any, next: any): void => {
  console.error('Global error handler:', err);
  
  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    res.status(400).json({ error: 'Validation error', details: err.message });
  } else if (err.name === 'UnauthorizedError' || err.message?.includes('Authentication')) {
    res.status(401).json({ error: 'Unauthorized', message: err.message });
  } else if (err.name === 'ForbiddenError' || err.message?.includes('Forbidden')) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  } else if (err.code?.startsWith('P')) { // Prisma errors
    res.status(400).json({ error: 'Database error', message: 'Invalid data provided' });
  } else {
    // Generic server error
    res.status(500).json({ 
      error: 'Internal server error', 
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
});

// Export server for use in index.ts
export { server };