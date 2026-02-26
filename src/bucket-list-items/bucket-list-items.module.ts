import { Module } from '@nestjs/common';
import { BucketListItemsService } from './bucket-list-items.service';
import { BucketListItemsController } from './bucket-list-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BucketList } from 'src/bucket-lists/entities/bucket-list.entity';
import { BucketListItem } from './entities/bucket-list-item.entity';
import { User } from 'src/users/entities/user.entity';
import { BucketListsModule } from 'src/bucket-lists/bucket-lists.module';
import { Destination } from 'src/destinations/entities/destination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BucketList, BucketListItem, Destination]), // 세가지 모두 repository를 사용하기 위해서 forFeature를 사용한다.
    BucketListsModule,
  ],
  providers: [BucketListItemsService],
  controllers: [BucketListItemsController],
})
export class BucketListItemsModule {}
