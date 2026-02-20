import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { Repository } from 'typeorm';
import { Destination } from './entities/destination.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationsRepository: Repository<Destination>,
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
