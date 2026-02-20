import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { CreateDestinationDto } from './dto/create-destination.dto';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  /**
   * async 사용 이유:
   * 1. Service 메서드(create, findAll 등)는 DB 작업으로 Promise를 반환하므로, 이 핸들러가 비동기임을 명시
   * 2. 나중에 try/catch 에러 처리, 여러 await 호출 등이 필요할 때 async가 필요
   * 3. return service.xxx()만 할 경우 async 없어도 동작하지만, 관례상 비동기 핸들러에는 async를 붙임
   */

  // 2.	**여행지 등록 API** - 새로운 여행지 등록 API 구현 (POST /destinations)
  @Post('')
  async createDestination(@Body() body: CreateDestinationDto) {
    // CreateDestinationDto에서 created_by 필드를 User 타입으로 추가해서 누가 만들어졌는지 알 수 있도록 하면 더 탄탄한 서비스가 될 것
    return this.destinationsService.create(body);
  }

  // 3.	**여행지 목록 조회 API** - 모든 여행지 목록을 조회하는 API 구현 (GET /destinations)
  @Get('')
  async findAllDestinations() {
    return this.destinationsService.findAll();
  }

  // 4.	**여행지 상세 조회 API** - 특정 여행지의 세부 정보를 조회하는 API 구현 (GET /destinations/:id)
  @Get(':id')
  async findDestinationById(@Param('id', ParseIntPipe) id: number) {
    return this.destinationsService.findById(id);
  }

  // 5.	**여행지 삭제 API** - 특정 여행지 삭제 API 구현 (DELETE /destinations/:id)
  @Delete(':id')
  async removeDestination(@Param('id', ParseIntPipe) id: number) {
    return this.destinationsService.remove(id);
  }
}
