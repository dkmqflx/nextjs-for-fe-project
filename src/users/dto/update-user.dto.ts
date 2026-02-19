import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// 일부분만 업데이트 하고 싶을 수도 있으므로 PartialType을 사용
export class UpdateUserDto extends PartialType(CreateUserDto) {
  refreshToken?: string | null;
}
