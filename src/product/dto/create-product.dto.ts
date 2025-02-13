import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.toLowerCase().trim())
  @Type(() => String)
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

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}
