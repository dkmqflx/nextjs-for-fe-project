import { BucketListItem } from 'src/bucket-list-items/entities/bucket-list-item.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
@Index('idx_destination_description', ['description']) // name은 unique 제약 조건이 있기 때문에 Index가 만들어져 있을 것, 그러므로 description에만 Index를 만들어준다.
export class Destination {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true, // 중복되는 이름의 여행지가 있을 수 없기 때문에 unique 제약 조건 추가
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  location: string;

  @OneToMany(
    () => BucketListItem,
    (bucketListItem) => bucketListItem.destination,
  )
  bucketListItems: BucketListItem[];
}
