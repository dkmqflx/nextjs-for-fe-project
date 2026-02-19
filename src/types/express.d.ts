// Express Request 타입 확장
declare namespace Express {
  export interface Request {
    user?: {
      sub: string;
      username: string;
      refreshToken?: string;
    };
  }
}
