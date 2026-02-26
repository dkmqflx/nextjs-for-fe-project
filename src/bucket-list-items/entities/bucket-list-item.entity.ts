import { BucketList } from 'src/bucket-lists/entities/bucket-list.entity';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BucketListItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BucketList, (bucketList) => bucketList.items)
  bucketList?: BucketList;

  @ManyToOne(() => Destination, (destination) => destination.bucketListItems, {
    eager: true,
    // eager: true -> destination 컬럼을 join 하여 조회한다.
    // 이렇게 매번 옵션을 전달할 필요 없이 entity 파일에서 설정해줄 수 있다
  })
  destination: Destination;

  @Column({ default: false })
  achieved: boolean;
}
