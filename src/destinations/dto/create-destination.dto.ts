export class CreateDestinationDto {
  name: string;
  description?: string;
  location: string;

  // entity에 정의되어 있는 bucketListItems는 생성시점에 받지 않는다.
}
