import {
  Controller,
  Post,
  Get,
  Body,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Request
} from 'tsoa';
import { authService } from '../services/authService';
import { 
  SendOTPRequest, 
  SendOTPResponse, 
  VerifyOTPRequest, 
  VerifyOTPResponse,
  AuthResponse 
} from '../types/auth.types';
import { Request as ExpressRequest } from 'express';

@Route('api/auth')
@Tags('Authentication')
export class AuthController extends Controller {

  /**
   * Send OTP for user registration
   * @summary Send OTP to email for registration
   */
  @Post('/send-register-otp')
  @SuccessResponse(200, 'OTP sent successfully')
  @Response(400, 'Invalid request or user already exists')
  public async sendRegisterOTP(@Body() requestBody: SendOTPRequest): Promise<SendOTPResponse> {
    const result = await authService.sendRegisterOTP(requestBody.email);
    
    if (!result.success) {
      this.setStatus(400);
    }
    
    return result;
  }

  /**
   * Verify OTP and create user account
   * @summary Verify registration OTP and create account
   */
  @Post('/verify-register-otp')
  @SuccessResponse(200, 'Registration successful')
  @Response(400, 'Invalid OTP or registration failed')
  public async verifyRegisterOTP(@Body() requestBody: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const result = await authService.verifyRegisterOTP(requestBody.email, requestBody.otp);
    
    if (!result.success) {
      this.setStatus(400);
    }
    
    return result;
  }

  /**
   * Send OTP for user login
   * @summary Send OTP to email for login
   */
  @Post('/send-login-otp')
  @SuccessResponse(200, 'OTP sent successfully')
  @Response(400, 'Invalid request or user not found')
  public async sendLoginOTP(@Body() requestBody: SendOTPRequest): Promise<SendOTPResponse> {
    const result = await authService.sendLoginOTP(requestBody.email);
    
    if (!result.success) {
      this.setStatus(400);
    }
    
    return result;
  }

  /**
   * Verify OTP and login user
   * @summary Verify login OTP and authenticate user
   */
  @Post('/verify-login-otp')
  @SuccessResponse(200, 'Login successful')
  @Response(400, 'Invalid OTP or login failed')
  public async verifyLoginOTP(@Body() requestBody: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const result = await authService.verifyLoginOTP(requestBody.email, requestBody.otp);
    
    if (!result.success) {
      this.setStatus(400);
    }
    
    return result;
  }

  /**
   * Get current authenticated user
   * @summary Get current user information
   */
  @Get('/me')
  @SuccessResponse(200, 'User information retrieved')
  @Response(401, 'Unauthorized')
  public async getCurrentUser(@Request() request: ExpressRequest): Promise<AuthResponse> {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.setStatus(401);
      return {
        success: false,
        message: 'No authorization token provided'
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = authService.verifyToken(token);
    
    if (!decoded) {
      this.setStatus(401);
      return {
        success: false,
        message: 'Invalid or expired token'
      };
    }

    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      this.setStatus(401);
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      message: 'User information retrieved successfully',
      user
    };
  }

  /**
   * Logout user
   * @summary Logout current user
   */
  @Post('/logout')
  @SuccessResponse(200, 'Logged out successfully')
  public async logout(): Promise<AuthResponse> {
    // Since we're using stateless JWT tokens, logout is handled on the client side
    // In a production app, you might want to implement token blacklisting
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }
}