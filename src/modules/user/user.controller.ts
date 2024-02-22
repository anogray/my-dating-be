import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, FilterUsersDto, ReceviedUsersDto, SeenUserDto } from './dto/user.dto';
import { User } from 'src/entities/user.entity';
import { Interests } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserDecorator } from 'src/decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard) 
  async userProfile() {
    // return "Get Users";
    return this.userService.getUsers();
  }

  @Post('create')
  @UseGuards(AuthGuard) 
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
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

  @Get('received')
  @UseGuards(AuthGuard)
  async receivedUsers(@UserDecorator() user:any,@Query() filter:ReceviedUsersDto){
    console.log({user,filter})
    return await this.userService.receivedUsers(user.id, filter);
    
  }
}
