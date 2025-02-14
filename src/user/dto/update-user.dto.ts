import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/auth/dto/create-auth.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
