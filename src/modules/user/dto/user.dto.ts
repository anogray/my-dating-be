import { IsNotEmpty, IsEmail, IsDateString, IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EducationLevel, DatingGoal, Interests, Languages, Gender, SeenUser } from 'src/common/enums/user.enum';

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
    @IsOptional()
    minAge?: number;

    @IsNumber()
    @IsOptional()
    maxAge?: number;

    @IsString()
    @IsOptional()
    location?: string;

    @IsOptional()
    @IsEnum(Interests, { each: true })
    interests?: Interests[];

    @IsOptional()
    @IsEnum(DatingGoal)
    dating_goal?: DatingGoal;

    @IsOptional()
    @IsEnum(Languages, { each: true })
    languages?: Languages[];
}

export class SeenUserDto {

    @IsString()
    seenUserId: string;

    @IsOptional()
    @IsEnum(SeenUser)
    status?:SeenUser
}

export class ReceviedUsersDto {
    @IsEnum(SeenUser)
    status:SeenUser
}
