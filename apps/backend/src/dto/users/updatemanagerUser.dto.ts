import { IsUUID, ValidateIf } from 'class-validator';

export class UpdateManagerUserDto {
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  managerId!: string | null;
}
