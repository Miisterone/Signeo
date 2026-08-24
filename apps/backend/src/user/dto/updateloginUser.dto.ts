import { IsString } from "class-validator";

export class UpdateLoginAtUserDto{
   @IsString()
   lastLoginAt!: string; 
}