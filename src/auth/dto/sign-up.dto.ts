import { CreateUserDto } from 'src/users/dto/create-user.dto';

// 모든 타입이 필요하기 때문에 PartialType을 사용하지 않음
export class SignUpDto extends CreateUserDto {}
