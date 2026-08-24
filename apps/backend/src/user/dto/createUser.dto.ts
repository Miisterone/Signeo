import { IsBoolean, IsEmail,IsEnum,IsInt,IsOptional,IsString,IsUUID,MinLength} from 'class-validator';
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
  @IsString()
  hiredAt?: string;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsUUID()
  managerId?: string;
}
