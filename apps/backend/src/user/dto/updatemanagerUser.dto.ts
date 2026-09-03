import { IsString } from 'class-validator';

export class UpdateManagerUserDto {
  @IsString()
  managerId?: string;
}
