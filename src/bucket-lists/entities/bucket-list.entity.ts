import { BucketListItem } from 'src/bucket-list-items/entities/bucket-list-item.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['name', 'user'], { unique: true })
// name과 user로 유니크한 버킷리스트를 지정했기 때문에 이 인덱스를 사용하면 더 빠르게 조회할 수 있다.
// -> service의 create 함수
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
  user?: User;

  @OneToMany(
    () => BucketListItem,
    (bucketListItem) => bucketListItem.bucketList,
  )
  items: BucketListItem[];
}

/**
 * database에서 보면, bucket-lists에는 user id가 foreign key로 저장되어 있다.
 *
 * bucket-list-items에는 bucket-list id와 destination id가 foreign key로 저장되어 있다.
 *
 * destinations에는 아무런 foreign key가 저장되어 있지 않다.
 *
 * 즉, ManyToOne 관계는 foreign key를 저장하고, OneToMany 관계는 primary key를 저장한다.
 * 따라서 ManyToOne, OneToMany 만 잘 설정해두면 이렇게 외래키를 통해서 연결된 데이터를 조회할 수 있다.
 */
