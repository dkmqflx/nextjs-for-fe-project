import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({
  path: `env.${process.env.NODE_ENV || 'local'}`,
});

const config = {
  type: 'postgres',
  host: `${process.env.DB_HOST || 'localhost'}`,
  port: parseInt(`${process.env.DB_PORT || '5432'}`, 10),
  username: `${process.env.DB_USERNAME || 'test'}`,
  password: `${process.env.DB_PASSWORD || 'test'}`,
  database: `${process.env.DB_DATABASE || 'bucketlist'}`,
  entities: ['dist/**/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
};

if (process.env.NODE_ENV === 'production') {
  // @ts-expect-error - TypeORM의 ssl 옵션은 기본적으로 정의되어 있지 않습니다.
  config.ssl = true;
  // @ts-expect-error - TypeORM의 extra 옵션은 기본적으로 정의되어 있지 않습니다.
  config.extra = {
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
