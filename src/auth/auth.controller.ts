import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import type { Request } from 'express';
import { RefreshTokenGuard } from 'src/common/guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  // access token을 보내준다면, 그 토큰이 유효한지 검사하고, 유효하다면 로그아웃 처리
  @UseGuards(AccessTokenGuard)
  @Get('signout')
  signOut(@Req() req: Request) {
    const userId = req.user!.sub;
    return this.authService.signOut(userId);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshAllTokens(@Req() req: Request) {
    const userId = req.user!.sub; //  Non-null assertion (!)을 사용한 이유는 Guard를 통과했다면 req.user가 반드시 존재하기 때문에 안전합니다.
    const refreshToken = req.user!.refreshToken!;

    return this.authService.refreshAllTokens(userId, refreshToken);
  }
  // body를 보내고 있지도 않고, 새로운 리프레시 토큰을 가져온다는 의미도 있기 때문에 GET으로 처리
}
