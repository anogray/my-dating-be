import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async userProfile() {
    // return "Get Users";
    return this.userService.getUsers();
  }

  @Post("create")
    async createUser(@Body() createUserDto: CreateUserDto) {
        console.log({createUserDto})
        return this.userService.createUser(createUserDto);
    }
}
