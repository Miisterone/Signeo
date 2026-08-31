import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  role: Role = Role.AGENT;

  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  seniority?: number = 0;

  @IsOptional()
  @IsDateString()
  hiredAt?: string;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsUUID()
  managerId?: string;
}
