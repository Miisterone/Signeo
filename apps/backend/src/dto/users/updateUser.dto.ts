import { IsOptional, IsString } from 'class-validator';
import { EmptyToNull } from '../transforms';

// Email is not editable here: it is owned by Supabase Auth and synced
// into the User table by SupabaseStrategy once the change is confirmed.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  phone?: string | null;
}
