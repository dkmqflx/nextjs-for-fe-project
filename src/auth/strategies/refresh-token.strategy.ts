// src/auth/strategies/refresh-token.strategy.ts

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
      passReqToCallback: true, // Request 객체를 validate 메서드로 전달하도록 설정
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.get('Authorization')!.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
    // { ...payload, refreshToken } → payload와 refreshToken을 합쳐서 반환
    // 이 타입을 types/express.d.ts에 추가해야지 타입 에러가 발생하지 않는다
  }
  /*
    validate 메서드가 호출되었다는 것은 이미 Passport가 다음을 검증했다는           
  의미입니다:                                                                   
  1. Authorization 헤더에 JWT 토큰이 존재함                                       
  2. JWT 서명이 유효함                                                          
  3. JWT가 만료되지 않음                                                        

  따라서 실제로는 req.get('Authorization')이 undefined일 가능성이 없습니다.

  문제는 TypeScript가 Passport의 내부 동작 흐름을 알지 못하고, Express의
  Request.get() 타입 정의가 string | undefined를 반환하도록 되어 있기 때문입니다
  */
}
