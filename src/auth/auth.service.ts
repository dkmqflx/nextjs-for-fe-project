import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import * as argon2 from 'argon2';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService, // 환경변수 접근용
  ) {}

  private readonly logger = new Logger(AuthService.name); // 어느 서비스에서 사용하는지 명시적으로 알려준다
  // 아래와 같이 로그가 찍힌다
  // [Nest] 51139  - 03/06/2026, 6:33:51 PM   ERROR [AuthService] newUser으로 이미 가입된 계정이 있습니다.

  // signUp
  async signUp(data: SignUpDto): Promise<any> {
    // user exists?
    const existUser = await this.usersService.findByUsername(data.username);
    if (existUser) {
      this.logger.error(`${data.username}으로 이미 가입된 계정이 있습니다.`);

      throw new BadRequestException(
        `${data.username}으로 이미 가입된 계정이 있습니다.`,
      );
    }

    // password encryption
    const hashedPassword = await this.hashFn(data.password);
    const newUser = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    // user대신 token을 반환
    const tokens = await this.getTokens(newUser);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    this.logger.log(
      `[유저 회원가입 완료] ID: ${newUser.id}, 유저 이름 : ${newUser.username}`,
    );

    return tokens;
  }

  // signIn
  async signIn(data: SignInDto): Promise<any> {
    const user = await this.usersService.findByUsername(data.username);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const isPasswordMatched = await argon2.verify(user.password, data.password);
    if (!isPasswordMatched) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async signOut(userId: string) {
    await this.usersService.update(userId, {
      refreshToken: null,
      /**
       *  undefined vs null - TypeORM의 동작 방식: 
       *  현재 DB 상태:                                                                          
       *  User { id: "123", refreshToken: "abc123xyz" }  // 로그인 상태

       *  undefined 사용 시:
        await this.usersService.update(userId, {
        refreshToken: undefined,
      });

      * TypeORM의 동작:
      *  - undefined 필드는 SQL 쿼리에서 아예 제외됨
      *  - 실제 SQL: UPDATE users SET ... WHERE id = '123' (refreshToken을 건드리지 않음)
      *  - 결과: DB에 refreshToken: "abc123xyz" 그대로 남아있음! ❌

       *  null 사용 시:

    await this.usersService.update(userId, {
      refreshToken: null,
    });

       *  TypeORM의 동작:
      *  - null은 명시적으로 SQL에 포함됨
      *  - 실제 SQL: UPDATE users SET refreshToken = NULL WHERE id = '123'
      *  - 결과: DB에 refreshToken: null 저장됨! ✅

      보안 문제:

      로그아웃 후:
      - undefined 사용 → DB에 토큰 남음 → 탈취된 토큰으로 계속 접근 가능 🚨
      - null 사용 → DB에서 토큰 제거 → 토큰 갱신 불가능 ✅
       */
    });
  }

  // 엑세스 토큰을 리프레시 토큰을 활용해서 재발급 받을 수 있다. -> 완전히 새로운 토큰 세트를 발급
  async refreshAllTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('refresh token이 존재하지 않습니다.');
    }

    const isRefreshTokenMatched = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!isRefreshTokenMatched) {
      throw new ForbiddenException('refresh token이 일치하지 않습니다.');
    }

    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async hashFn(data: string): Promise<string> {
    return argon2.hash(data);
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashFn(refreshToken);
    // refreshToken 한번 더 암호화 하는 이유는 DB에 저장할 때 보안을 위해서

    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private async getTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      // signAsync -> 새로운 JWT 토큰 생성
      this.jwtService.signAsync(
        // 첫번째 -> payload
        {
          sub: user.id, // subject, 토큰의 주체
          username: user.username, // 나중에 컨트롤러 같은 데서 편하게 쓰려고
        },
        // 두번째 -> configuration
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'), // 시크릿키
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          username: user.username,
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
