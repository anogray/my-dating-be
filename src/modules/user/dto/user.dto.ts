import { IsNotEmpty, IsEmail, IsDateString, IsString, IsEnum, IsNumber } from 'class-validator';
import { EducationLevel, DatingGoal, Interests, Languages, Gender } from 'src/common/enums/user.enum';

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
    @IsEnum(Gender)
    gender: Gender;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsString()
    profilePicture: string;

    @IsString()
    bio: string;

    @IsNotEmpty()
    @IsEnum(EducationLevel)
    education_level: EducationLevel;

    @IsNotEmpty()
    @IsEnum(DatingGoal)
    dating_goal: DatingGoal;

    @IsNotEmpty()
    @IsEnum(Interests, { each: true })
    interests: Interests[];

    @IsNotEmpty()
    @IsEnum(Languages, { each: true })
    languages: Languages[];

    @IsNotEmpty()
    @IsNumber()
    height: number;
}

export class FilterUsersDto {
    @IsNumber()
    minAge?: number;

    @IsNumber()
    maxAge?: number;

    @IsString()
    location?: string;

    @IsEnum(Interests, { each: true })
    interests?: Interests[];

    @IsEnum(DatingGoal)
    dating_goal?: DatingGoal;

    @IsEnum(Languages, { each: true })
    languages?: Languages[];
}
