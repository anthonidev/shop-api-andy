import { IsOptional, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  offset?: number;
}
