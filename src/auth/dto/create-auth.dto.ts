import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  @Transform(({ value }) => value.toLowerCase().trim())
  username: string;

  @IsString()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d@$!%*?&]{6,}$/, {
    message:
      'La contraseña debe tener al menos una letra mayúscula y una minúscula, y un mínimo de 6 caracteres',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
