import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsDateString, IsString, IsEnum, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { EducationLevel, DatingGoal, Interests, Languages, Gender, REQUESTUSER, LikeRejectUser } from 'src/common/enums/user.enum';
import { ArrayContains } from 'typeorm';


class EmailPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class CreateUserDto {
    // @IsOptional()
    // @IsString()
    // username?: string;

    // @IsNotEmpty()
    // @IsEmail()
    // email: string;

    // @IsNotEmpty()
    // @IsString()
    // password: string;

    @ValidateNested()
    @Type(() => EmailPasswordDto)
    emailPassword: EmailPasswordDto;


    @IsOptional()
    @IsNumber()
    otp?:number

    // @IsOptional()
    // @IsString()
    // yob?: number;

    // @IsOptional()
    // @IsEnum(Gender)
    // gender?: Gender;

    // @IsOptional()
    // @IsString()
    // location?: string;

    // @IsOptional()
    // @IsString()
    // bio?: string;

    // @IsOptional()
    // @IsEnum(EducationLevel)
    // education_level: EducationLevel;

    // @IsOptional()
    // @IsEnum(DatingGoal)
    // dating_goal: DatingGoal;

    // @IsOptional()
    // @IsEnum(Interests, { each: true })
    // interests: Interests[];

    // @IsOptional()
    // @IsEnum(Languages, { each: true })
    // languages: Languages[];

    // @IsOptional()
    // @IsNumber()
    // height: number;
}

export class UpdateUserDto {
    // @IsOptional()
    // @IsDateString()
    // dateOfBirth?: string;

    @IsOptional()
    @IsString()
    yob?: number;

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

export class RemoveImageDto{
    @IsNotEmpty()
    @IsString()
    image:string
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


export class LikeRejectUserDto {

    @IsString()
    userId: string;

    @IsOptional()
    @IsEnum(LikeRejectUser)
    status:LikeRejectUser
}

export class ReceviedUsersDto {
    @IsEnum(REQUESTUSER)
    status:REQUESTUSER
}

export class MessageDto {

    @IsOptional()
    @IsString()
    senderId?:string;

    @IsNotEmpty()
    @IsString()
    recipientId: string;

    @IsNotEmpty()
    @IsString()
    content: string;
}
