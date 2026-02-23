import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBucketListDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
