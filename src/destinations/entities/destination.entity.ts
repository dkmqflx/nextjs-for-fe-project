import { BucketListItem } from 'src/bucket-list-items/entities/bucket-list-item.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
