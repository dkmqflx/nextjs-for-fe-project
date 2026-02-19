import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access-token') {}
// auth-access-token은 우리가 strategy.ts에서 이름 붙인 전략 이름과 일치해야 한다.
