import { Transform, Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @Transform(({ value }) => value.toLowerCase().trim())
  @Type(() => String)
  name: string;
}
