import { Module } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { DestinationsController } from './destinations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from './entities/destination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Destination])],
  providers: [DestinationsService],
  controllers: [DestinationsController],
})
export class DestinationsModule {}
