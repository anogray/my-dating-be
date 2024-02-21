import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, FilterUsersDto } from './dto/user.dto';
import { User } from 'src/entities/user.entity';
import { Interests } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/guards/auth.guard';

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
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log({ createUserDto });
    return this.userService.createUser(createUserDto);
  }

  @Get('filter')
  async filterUsers(@Query() filter: FilterUsersDto): Promise<User[]> {
    if (filter.interests && typeof filter.interests === 'string') {
      filter.interests = (filter.interests as any).split(',') as Interests[];
    }
    return await this.userService.filterUsers(filter);
}
}
