import { BucketList } from 'src/bucket-lists/entities/bucket-list.entity';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BucketListItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BucketList, (bucketList) => bucketList.items)
  bucketList: BucketList;

  @ManyToOne(() => Destination, (destination) => destination.bucketListItems)
  destination: Destination;

  @Column({ default: false })
  achieved: boolean;
}
