import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NormalizeEmail } from '../transforms';

export class LoginUserDto {
  @ApiProperty({
    example: 'test@test.com',
  })
  @NormalizeEmail()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Test',
  })
  @IsString()
  password!: string;
}
