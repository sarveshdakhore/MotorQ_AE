export interface sendPass{
  email: string;
  password: string;
}

export interface LoginWithPasswordRequest {
  email: string;
  password: string;
}

export interface RegisterWithPasswordRequest {
  email: string;
  password: string;
}

export interface PasswordAuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    createdAt: Date;
  };
  token?: string;
}

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  otp: string; // Always return OTP for frontend display (testing purposes)
}

export interface VerifyOTPRequest {
  email: string;
  otp?: string;
  password: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    createdAt: Date;
  };
  token?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: Date;
  role?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}