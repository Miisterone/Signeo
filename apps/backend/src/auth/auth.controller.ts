import { Body, Controller, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../dto/auth/loginUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() dto: LoginUserDto, @Ip() ip: string) {
    return this.authService.login(dto, ip);
  }
}
