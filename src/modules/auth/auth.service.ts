// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './auth.dto';
import { User } from 'src/entities/user.entity';
import { UserService } from '../user/user.service'; // Import UserService

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService,
  ) {}

  async login(authCredentialsDto: AuthCredentialsDto) {
    try {
      const { username, email, password } = authCredentialsDto;

      const user = await this.userService.findByUsernameOrEmail(
        username ? username : email,
      );

      const isUserValidated = user
        ? await this.userService.checkPassword(user.email, password)
        : false;
      if (!isUserValidated) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { username: user.username, id: user.id };

      return {
        access_token: this.jwtService.sign(payload),
      };

      return true;
    } catch (err) {
      console.log({ err });
    }
  }
}
