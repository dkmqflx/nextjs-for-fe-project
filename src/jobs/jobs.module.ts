import { Module } from '@nestjs/common';
import { DailyScheduleService } from './daily-schedule.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [DailyScheduleService],
})
export class JobsModule {}
