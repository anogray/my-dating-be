import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, FilterUsersDto, ReceviedUsersDto, SeenUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from 'src/entities/user.entity';
import { Interests } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserDecorator } from 'src/decorators/user.decorator';
import { UserMediaImageValidation } from 'src/common/pipes/user.media.validation.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get("test")
  async getData() {
    // return "Get Users";
    return "gotData";
  }


  @Get()
  @UseGuards(AuthGuard) 
  async userProfile(@UserDecorator() user:any) {
    // return "Get Users";
    return this.userService.getUsers(user.id);
  }

  @Post('create')
  @UseGuards(AuthGuard) 
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
  
  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 4 },
    ]),
  )
  async updateUser(@Param('id') userId: string,@Body() updateDto: UpdateUserDto, @UploadedFiles(new UserMediaImageValidation()) files: {
    images?: Express.Multer.File[];
  } ) {
    return this.userService.updateUser(userId, updateDto, files);
}


  @Post('action')
  @UseGuards(AuthGuard) 
  async actionUser(@UserDecorator() user:any, @Body() seenUserDto: SeenUserDto) {
    return this.userService.actionUser(user.id,seenUserDto);
  }

  @Get('filter')
  @UseGuards(AuthGuard) 
  async filterUsers(@UserDecorator() user:any, @Query() filter: FilterUsersDto): Promise<User[]> {
    if (filter.interests && typeof filter.interests === 'string') {
      filter.interests = (filter.interests as any).split(',') as Interests[];
    }
    return await this.userService.filterUsers(user.id, filter);
  }

  @Get('sent')
  @UseGuards(AuthGuard)
  async sentUsers(@UserDecorator() user:any){
    return await this.userService.sentUsers(user.id);
  }

  @Get('received')
  @UseGuards(AuthGuard)
  async receivedUsers(@UserDecorator() user:any,@Query() filter:ReceviedUsersDto){
    console.log({user,filter})
    return await this.userService.receivedUsers(user.id, filter);
  }
}
