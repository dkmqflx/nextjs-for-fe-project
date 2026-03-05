import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { Repository, Like } from 'typeorm';
import { Destination } from './entities/destination.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
@Injectable()
export class DestinationsService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationsRepository: Repository<Destination>,
    @Inject(CACHE_MANAGER) // 캐시 서비스를 사용하기 위해서 주입
    private readonly cacheManager: Cache,
  ) {}

  // 2.	**여행지 등록 API** - 새로운 여행지 등록 API 구현 (POST /destinations)
  async create(model: CreateDestinationDto): Promise<Destination> {
    const existingDestination = await this.destinationsRepository.findBy({
      name: model.name,
    });

    // 에러를 던지지 않으면, 500 에러가 발생한다.
    if (existingDestination.length > 0) {
      throw new BadRequestException('이미 존재하는 여행지입니다.');
    }

    /**
     * create와 save를 분리하는 이유는 create는 데이터베이스에 저장하지 않고, save는 데이터베이스에 저장하기 때문이다.
     * create 함수를 통해서 default값을 설정할 수 있다. (e.g. createdAt, updatedAt)
     */

    const destination = this.destinationsRepository.create({
      ...model,
    });

    const createdDestination =
      await this.destinationsRepository.save(destination);
    // save()가 반환하는 값 -> 새로 INSERT된 row

    return createdDestination;
  }

  // 3.	**여행지 목록 조회 API** - 모든 여행지 목록을 조회하는 API 구현 (GET /destinations)
  async findAll(): Promise<Destination[]> {
    return this.destinationsRepository.find();
  }

  // 4.	**여행지 상세 조회 API** - 특정 여행지의 세부 정보를 조회하는 API 구현 (GET /destinations/:id)
  async findById(id: number) {
    return this.destinationsRepository.findOneBy({
      id,
    });
    // return 하는 결과는 0개 혹은 1개의 row를 반환한다.
    // 여기서 findOneBy를 사용한 이유는 위에서 중복되는 이름의 여행지가 있을 수 없기 때문이다.

    // 아무것도 없을 때 404를 반환할지, 이렇게 아무것도 없는 응답을 보낼지는 선택
  }

  async search(q: string): Promise<Destination[]> {
    // const cachedResult: any = await this.cacheManager.get(`search-${q}`);

    // 캐시 결과가 있을 때는 캐시 결과를 반환한다.
    // if (cachedResult) {
    //   return cachedResult;
    // }

    // 캐시 처리를 하게 되면, GET 요청시, 첫번째 요청 후 두번째 요청을 하게되면, 첫번째 요청에 비해 빠른 응답을 받을 수 있다.

    const result = await this.destinationsRepository.find({
      where: [
        {
          name: Like(`%${q}%`),
        },
        {
          description: Like(`%${q}%`),
        },
      ],
    });

    // await this.cacheManager.set(`search-${q}`, result, 1000 * 10);,

    // 주석처리한 부분처럼 코드를 작성하지 않고도
    // controller에서 데코레이터만 사용해서 캐싱 처리를 할 수 있다
    // 다만 복잡하거나 커스텀한 캐싱 처리를 할 때는 서비스 레이어에서 처리하는 것이 더 나은 경우도 있다

    return result;
  }

  // 5.	**여행지 삭제 API** - 특정 여행지 삭제 API 구현 (DELETE /destinations/:id)
  async remove(id: number): Promise<void> {
    const existingDestination = await this.findById(id);

    if (existingDestination) {
      await this.destinationsRepository.delete(id);
      return;
    }

    // 정상적으로 제거되지 않은 경우에는 이렇게 에러를 던진다.(404)
    throw new NotFoundException('존재하지 않는 여행지입니다.');
  }
}
