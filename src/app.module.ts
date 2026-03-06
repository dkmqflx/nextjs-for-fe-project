import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { DestinationsModule } from './destinations/destinations.module';
import { BucketListsModule } from './bucket-lists/bucket-lists.module';
import { BucketListItemsModule } from './bucket-list-items/bucket-list-items.module';
import typeorm from './config/typeorm';
import { AuthModule } from './auth/auth.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from './jobs/jobs.module';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm')!,
    }),
    CacheModule.register({
      isGlobal: true,
    }), // 전역적으로 CacheModule을 사용하기 위해서 설정
    ScheduleModule.forRoot(), // 라이브러리 설치 후에는 이렇게 모듈을 등록해주어야 한다. forRoot 해주면 모든 서비스에서 스케쥴러와 관련된 데코레이터를 사용할 수 있게 된다
    SentryModule.forRoot(),
    UsersModule,
    DestinationsModule,
    BucketListsModule,
    BucketListItemsModule,
    AuthModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    // 이렇게 설정하면 모든 컨트롤러에서 캐시 인터셉터를 사용할 수 있다.
    // https://docs.nestjs.com/techniques/caching
    {
      provide: APP_FILTER, // 모든 요청들에 대해서 sentry 글로벌 필터가 자동으로 에러를 수집하고 필터링 해준다
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
