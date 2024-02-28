import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsDateString, IsString, IsEnum, IsNumber, IsOptional, IsArray } from 'class-validator';
import { EducationLevel, DatingGoal, Interests, Languages, Gender, REQUESTUSER } from 'src/common/enums/user.enum';

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

export class UpdateUserDto {
    // @IsOptional()
    // @IsDateString()
    // dateOfBirth?: string;

    @IsOptional()
    @IsString()
    
    age?: number;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    // @IsOptional()
    // @IsString()
    // @IsArray({each:true})
    // images?: string[];

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsEnum(EducationLevel)
    education_level?: EducationLevel;

    @IsOptional()
    @IsEnum(DatingGoal)
    dating_goal?: DatingGoal;

    @IsOptional()
    @IsEnum(Interests, { each: true })
    interests?: Interests[];

    @IsOptional()
    @IsEnum(Languages, { each: true })
    languages?: Languages[];

    @IsOptional()
    @IsNumber()
    height?: number;

    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    longitude?: number;
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
    seen_user_id: string;

    @IsOptional()
    @IsEnum(REQUESTUSER)
    status?:REQUESTUSER
}

export class ReceviedUsersDto {
    @IsEnum(REQUESTUSER)
    status:REQUESTUSER
}
