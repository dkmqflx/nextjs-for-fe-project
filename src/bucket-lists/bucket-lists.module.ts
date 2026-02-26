import { Module } from '@nestjs/common';
import { BucketListsController } from './bucket-lists.controller';
import { BucketListsService } from './bucket-lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BucketList } from './entities/bucket-list.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BucketList, User])],
  controllers: [BucketListsController],
  providers: [BucketListsService],
  exports: [BucketListsService],
})
export class BucketListsModule {}
