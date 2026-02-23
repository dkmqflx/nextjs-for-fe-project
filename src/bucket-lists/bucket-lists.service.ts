import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { BucketList } from './entities/bucket-list.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateBucketListDto } from './dto/create-bucket-list.dto';

@Injectable()
export class BucketListsService {
  constructor(
    @InjectRepository(BucketList)
    private readonly bucketListsRepository: Repository<BucketList>,
    @InjectRepository(User) // bucketList에서 user를 참조하고 있기 때문에 user를 찾기 위해서는 user repository가 필요하다.
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    userId: string,
    model: CreateBucketListDto,
  ): Promise<BucketList> {
    // 먼저를 유저를 찾아준다
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('유저를 찾지 못했습니다.');
    }

    const existingBucketList = await this.bucketListsRepository.findOne({
      where: {
        name: model.name,
        user: {
          id: userId,
        },
      },
    });

    if (existingBucketList) {
      throw new BadRequestException('이미 존재하는 버킷리스트 입니다.');
    }

    const newBucketList = this.bucketListsRepository.create({
      ...model,
      user,
    });
    // 유저가 중복생성되는게 아닌가 생각할 수 있지만,
    // TypeOrm에서 create에 이렇게 relation이 걸려 있는 유저를 전달하면
    // 해당 모델을 만드는게 아니라, 모델과 매핑되어 있는 foreign key를 생성해준다

    /**
     * 1. 걱정되는 부분 (중복 생성?)
     * create 함수 안에 user 객체를 통째로 넣고 있습니다.
     * const newBucketList = this.bucketListsRepository.create({  ...model,  user, // <- 이 부분!});
     * 처음 보면 "어? 유저 객체를 통째로 넣으면 DB에 유저가 한 명 더 생기는 거 아냐?"라고 생각할 수 있습니다.
     *
     * 2. TypeORM의 동작 방식 (Foreign Key)
     * 하지만 TypeORM은 똑똑하게 동작합니다.
     * user 객체 안에 이미 id가 들어있다면, TypeORM은 "아, 이 유저를 새로 만들라는 게 아니라, 기존에 있는 이 유저랑 연결만 하라는 거구나!"라고 이해합니다.
     * 그래서 DB의 bucket_list 테이블에 데이터를 저장할 때, 유저의 모든 정보를 다시 저장하는 게 아니라 유저의 id값(Foreign Key, 외래키)만 딱 저장합니다.
     * 즉, entity에서 User 라고 되어 있지만 실제로는 id만 저장된다.
     */

    await this.bucketListsRepository.save(newBucketList);

    return { ...newBucketList, user: undefined };
    // 이렇게 하면 유저 정보는 반환하지 않는다.
    /**
     * response
     * {
     *   "id": 1,
     *   "name": "조지아 가기"
     * }
     */

    /**
     * Service에서 특정 필드를 제외하고 return하면,
     * 이를 호출하는 Controller에서도 해당 필드가 없는 객체를 받게 되므로
     * 최종 응답(Response)에서도 그 필드는 포함되지 않습니다.
     *
     *  Service에서 이미 user 필드를 지웠기 때문에,
     * Controller는 user 정보가 없는 데이터를 넘겨받게 됩니다.
     *  따라서 API를 호출한 클라이언트는 user 정보를 볼 수 없게 됩니다.
     *
     * 현재 방식처럼 undefined를 할당하는 것도 작동하지만,
     *  NestJS와 TypeORM을 사용할 때 보안이나 데이터 정제를 위해 주로 사용하는 다른 방법들도 있습니다.
     *  Destructuring 사용: 아예 변수에서 제외하고 나머지만 반환하는 방식입니다.
     *  const { user, ...result } = newBucketList;    return result;
     *  Class Transformer (@Exclude): Entity 정의 시 특정 필드에 @Exclude() 데코레이터를 붙여서 자동으로 응답에서 제외되도록 설정할 수 있습니다. (이 경우 ClassSerializerInterceptor 설정이 필요합니다.)
     *
     *      */
  }

  async findById(userId: string, id: number): Promise<BucketList | null> {
    return this.bucketListsRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });
  }

  async find(userId: string): Promise<BucketList[]> {
    return this.bucketListsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async remove(userId: string, id: number): Promise<void> {
    const bucketList = await this.findById(userId, id);

    if (!bucketList) {
      throw new BadRequestException('버킷리스트를 찾지 못했습니다.');
    }

    await this.bucketListsRepository.remove(bucketList);
    // delete는 id 만 넣어도 되고, remove는 객체를 넣어도 된다.

    /**
     *
     * 1. delete (ID 기반 삭제)
     * 사용법: repository.delete(1) 또는 repository.delete({ name: 'Paris' })
     * 동작: DB에 바로 DELETE SQL 쿼리를 날립니다.
     * 특징:
     * 엔티티를 DB에서 불러오지 않고 바로 삭제합니다. (속도가 빠름)
     * 엔티티가 존재하지 않아도 에러가 나지 않고 그냥 실행됩니다.
     * 중요: 엔티티 내부에 작성한 @BeforeRemove 같은 라이프사이클 훅(Hook)이 실행되지 않습니다.
     *
     * 2. remove (엔티티 객체 기반 삭제)
     * 사용법: repository.remove(bucketList) (먼저 DB에서 조회한 객체가 필요함)
     * 동작: 넘겨받은 엔티티 객체를 바탕으로 삭제합니다.
     * 특징:
     * 반드시 DB에서 조회해온 엔티티 객체가 있어야 합니다.
     * 라이프사이클 훅(@BeforeRemove, @AfterRemove 등)이 실행됩니다.
     * 삭제하려는 객체가 실제로 존재한다는 것이 보장된 상태에서 주로 사용합니다.
     *
     * 이렇게 "먼저 존재 여부를 확인하고,
     * 그 객체를 사용해 삭제"하는 흐름일 때는 remove를 쓰는 것이 자연스럽습니다.
     * 만약 나중에 "삭제될 때 로그를 남긴다"거나 하는 로직(@BeforeRemove)이 엔티티에 추가된다면,
     * remove를 써야만 그 로직이 작동합니다.
     */
  }
}
