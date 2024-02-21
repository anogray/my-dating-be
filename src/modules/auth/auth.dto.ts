// auth.dto.ts
import { IsNotEmpty, IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string;
}
