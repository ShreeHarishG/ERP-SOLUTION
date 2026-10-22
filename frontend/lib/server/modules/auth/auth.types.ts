export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export interface RefreshDto {
  refreshToken: string;
}
