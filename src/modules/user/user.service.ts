import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { User } from 'src/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto, FilterUsersDto } from './dto/user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRedis() private readonly redisService: Redis,
    private readonly configService: ConfigService
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const partialUser: DeepPartial<User> = {
        username: createUserDto.username,
        email: createUserDto.email,
        password: createUserDto.password,
        dateOfBirth: createUserDto.dateOfBirth,
        gender: createUserDto.gender,
        location: createUserDto.location,
        profilePicture: createUserDto.profilePicture,
        bio: createUserDto.bio,
        education_level: createUserDto.education_level,
        dating_goal: createUserDto.dating_goal,
        interests: createUserDto.interests,
        languages: createUserDto.languages,
        height: createUserDto.height,
      };
      const newUser = this.userRepository.create(partialUser);
      return await this.userRepository.save(newUser);
    } catch (err) {
      console.log('errr', err);
      throw err;
    }
  }

  async getUsers() {
    try {
      return await this.userRepository.find();
    } catch (err) {
      console.log('errr', err);
      throw err;
    }
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User> {
    return this.userRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
  }

  async checkPassword(email: string, password: string): Promise<boolean> {
    return this.userRepository.exists({
      where: [{ email:email, password: password }],
    });
  }

  async filterUsers(filter: FilterUsersDto): Promise<User[]> {
    try {
      console.log("checkEnv",this.configService.get<string>('JWT_SECRET'))

      const loggedInUserId = 1;
      const seenUsersKey = `seenUsers:${loggedInUserId}`;
      const seenUserIds = await this.redisService.smembers(seenUsersKey);

      const query = this.userRepository.createQueryBuilder('user');
      console.log({ filter });
      if (filter.minAge) {
        // Implement age filtering logic
      }

      if (filter.maxAge) {
        // Implement age filtering logic
      }

      if (filter.location) {
        query.where('user.location = :location', { location: filter.location });
      }

      if (filter.interests.length > 0) {
        query.andWhere('user.interests && :interestss', {
          interestss: filter.interests,
        });
      }

      if (filter.dating_goal) {
        query.andWhere('user.dating_goal = :datingGoal', {
          datingGoal: filter.dating_goal,
        });
      }

      if (filter?.languages?.length > 0) {
        query.andWhere('user.languages && :languages', {
          languages: filter.languages,
        });

        if (seenUserIds.length > 0) {
          query.andWhere('user.id NOT IN (:...seenUserIds)', { seenUserIds });
        }

      }
      return await query.getMany();
    } catch (err) {
      console.log('filterUsers Err', err);
    }
  }
}
