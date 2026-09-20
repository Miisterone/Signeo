import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'test@test.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Test',
  })
  @IsString()
  password!: string;
}
