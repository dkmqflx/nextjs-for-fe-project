// src/auth/strategies/access-token.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * 스트래터지는 기본적으로 유저의 인증을 처리하고, 성공하면 유저 정보를 반환합니다.
 * 리턴하는 페이로드에 아래 타입을 사용합니다.
 */
type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token', // 스트래터지 이름
) {
  constructor(private configService: ConfigService) {
    // super 호출 시, PassportStrategy의 constructor를 호출하게 된다
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 요청 헤더에서 JWT 추출 -> Bearer xxxxx에서 xxxxx만 추출하는 로직을 Passport가 대신 수행하는 것입니다.
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!, // 이렇게만 해도 JWT의 유효성 검증이 자동으로 수행됩니다.
      /**
       * JWT는 Header.Payload.Signature로 구성되는데,
       * Passport 엔진은 전달받은 토큰의 Header와 Payload를 서버의 Secret Key로 직접 다시 암호화해 봅니다.
       * 직접 만든 결과값 == 토큰에 적힌 Signature 라면? → "변조되지 않은 안전한 토큰이군!" (통과)
       * 다르다면? → "누군가 조작했거나 잘못된 키다!" (401 Unauthorized 에러 자동 발생)
       */
    });
  }

  // validate 메서드는 JWT가 유효할 때 호출됩니다.
  validate(payload: JwtPayload) {
    return payload;
    // { ...payload } → payload를 그대로 반환
    // 이 타입을 types/express.d.ts에 추가해야지 타입 에러가 발생하지 않는다
  }
}

/**
 * getTokens 메소드를 보면, sub(Subject)와 username을 페이로드에 담아 토큰을 생성하는 것을 알 수 있습니다.
 * validate 메서드에서는 이 페이로드를 그대로 반환하고 있습니다.
 * 따라서, 인증이 성공한 후에 req.user 객체에는 이 페이로드가 담기게 됩니다.
 * 
 *  전체 흐름:

  1. 요청이 들어옴 (예: Authorization: Bearer eyJhbGc...)
  2. Passport가 자동으로 실행하는 과정:
  ① jwtFromRequest로 토큰 추출
  → "eyJhbGc..." 문자열을 헤더에서 뽑아냄

  ② secretOrKey로 JWT 검증
   → JWT 서명이 유효한지 확인 (실패하면 401 에러)

  ③ 검증 성공하면 JWT를 디코딩
     → JWT는 "Header.Payload.Signature" 구조
     → Payload 부분을 디코딩하면: { sub: "123", username: "john" }

  ④ 디코딩된 payload를 validate() 메서드에 자동으로 전달
     → validate(payload) 호출됨!
  3. validate가 반환한 값이 req.user에 저장됨
 */
