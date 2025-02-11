import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @Type(() => Number)
  brandId?: number;
}
