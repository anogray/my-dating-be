import { IsNotEmpty, IsEmail, IsDateString, IsString } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsDateString()
    dateOfBirth: string;

    @IsNotEmpty()
    @IsString()
    gender: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsString()
    profilePicture: string;

    @IsString()
    bio: string;
}
