import { BucketListItem } from 'src/bucket-list-items/entities/bucket-list-item.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BucketList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @ManyToOne(() => User, (user) => user.bucketLists)
  user: User;

  @OneToMany(
    () => BucketListItem,
    (bucketListItem) => bucketListItem.bucketList,
  )
  items: BucketListItem[];
}
