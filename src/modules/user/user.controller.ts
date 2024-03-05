import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  FilterUsersDto,
  LikeRejectUserDto,
  MessageDto,
  ReceviedUsersDto,
  RemoveImageDto,
  SeenUserDto,
  UpdateUserDto,
} from './dto/user.dto';
import { User } from 'src/entities/user.entity';
import { Interests } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserDecorator } from 'src/decorators/user.decorator';
import { UserMediaImageValidation } from 'src/common/pipes/user.media.validation.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ErrorMessage } from 'src/common/constants';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('test')
  async getData() {
    // return "Get Users";
    return 'gotData';
  }

  @Get()
  @UseGuards(AuthGuard)
  async userProfile(@UserDecorator() user: any) {
    // return "Get Users";
    return this.userService.getUsers(user.id);
  }

  @Post('register')
  // @UseGuards(AuthGuard)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 4 }]))
  async updateUser(
    @UserDecorator() user: any,
    @Body() updateDto: UpdateUserDto,
    @UploadedFiles(new UserMediaImageValidation())
    files: {
      images?: Express.Multer.File[];
    },
  ) {
    return this.userService.updateUser(user.id, updateDto, files);
  }

  @Patch('delete-image')
  @UseGuards(AuthGuard)
  async removeProfileImage(@UserDecorator() user: any, @Body() removeImage:RemoveImageDto){
    return await this.userService.removeProfileImage(user.id, removeImage.image);
  }

  @Post('action')
  @UseGuards(AuthGuard)
  async actionUser(
    @UserDecorator() user: any,
    @Body() seenUserDto: LikeRejectUserDto,
  ) {
    return this.userService.actionUser(user.id, seenUserDto);
  }

  @Get('filter')
  @UseGuards(AuthGuard)
  async filterUsers(
    @UserDecorator() user: any,
    @Query() filter: FilterUsersDto,
  ): Promise<User[]> {
    if (filter.interests && typeof filter.interests === 'string') {
      filter.interests = (filter.interests as any).split(',') as Interests[];
    }
    console.log(user);
    return await this.userService.filterUsers(user.id, filter);
  }

  @Get('sent')
  @UseGuards(AuthGuard)
  async sentUsers(@UserDecorator() user: any) {
    return await this.userService.sentUsers(user.id);
  }

  @Get('received')
  @UseGuards(AuthGuard)
  async receivedUsers(
    @UserDecorator() user: any,
    @Query() filter: ReceviedUsersDto,
  ) {
    console.log({ user, filter });
    return await this.userService.receivedUsers(user.id, filter);
  }

  @Post('chat/send')
  @UseGuards(AuthGuard)
  async postMessage(@UserDecorator() user: any,@Body() body:MessageDto){
    return await this.userService.postMessage({...body,senderId:String(user.id)});
  }
  
  @Get('chat/:id')
  @UseGuards(AuthGuard)
  async userChat(@UserDecorator() user: any,@Param('id') id:string, @Query('page') page: string = '1', @Query('limit') limit: string = '100'){

    const pageNumber = parseInt(page, 10);
    const messageLimit = parseInt(limit, 10);

    if (!id || pageNumber < 1 || messageLimit < 1) {
      throw ErrorMessage.userError.userChatInvalidRequest;

    }  
    return await this.userService.userChat(user.id,id,pageNumber,messageLimit);
  }

  
}
