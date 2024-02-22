import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { User } from 'src/entities/user.entity';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import {
  CreateUserDto,
  FilterUsersDto,
  ReceviedUsersDto,
} from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { SeenUser } from 'src/entities/seen_user.entity';
import { SeenUserDto } from './dto/user.dto';
import { ErrorMessage } from 'src/common/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SeenUser)
    private seenUser: Repository<SeenUser>,
    @InjectRedis() private readonly redisService: Redis,
    private readonly configService: ConfigService,
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
      const newUser = this.userRepository.create(createUserDto);
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
      where: [{ email: email, password: password }],
    });
  }

  async filterUsers(userId: string, filter: FilterUsersDto): Promise<User[]> {
    try {
      const seenUsersKey = `user:${userId}:actionUsers`;
      let seenUserIds: any = await this.redisService.smembers(seenUsersKey);
      if (!seenUserIds.length) {
        seenUserIds = await this.seenUser
          .createQueryBuilder('seen_user')
          .select('seen_user."seenUserId"')
          .where('seen_user."userId" = :userId', { userId })
          .getRawMany();
        seenUserIds = seenUserIds.map(
          (result: { seenUserId: any }) => result.seenUserId,
        );
      }
      console.log({ seenUserIds });

      if (seenUserIds.length) {
        await this.redisService.sadd(`user:${userId}:actionUsers`, seenUserIds);
      }

      const query = this.userRepository.createQueryBuilder('user');

      query.where('user.id != :userId', { userId });

      console.log({ filter });
      if (filter.minAge) {
        // Implement age filtering logic
      }

      if (filter.maxAge) {
        // Implement age filtering logic
      }

      if (filter.location) {
        query.andWhere('user.location = :location', {
          location: filter.location,
        });
      }

      if (filter.interests?.length > 0) {
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
      }

      if (seenUserIds.length > 0) {
        query.andWhere('user.id NOT IN (:...seenUserIds)', { seenUserIds });
      }

      return await query.getMany();
    } catch (err) {
      console.log('filterUsers Err', err);
    }
  }

  async actionUser(userId: string, seenUserDto: SeenUserDto) {
    try {
      const seenUsersKey = `user:${userId}:actionUsers`;
      await this.redisService.sadd(seenUsersKey, seenUserDto.seenUserId);
      await this.seenUser.save({ userId, ...seenUserDto });
    } catch (error) {
      if (error?.code === '23505') {
        throw ErrorMessage.userError.duplicateRequest;
      }
      console.log('actionUser errrror', error);
      throw error;
    }
  }

  async receivedUsers(userId: string, filter: ReceviedUsersDto) {
    try {
      const users = await this.seenUser
        .createQueryBuilder('seen_user')
        .where('seen_user.userId IS NOT NULL')
        .andWhere('seen_user.userId =:userId', { userId })
        .andWhere('seen_user.status = :status', { status: filter.status })
        .leftJoinAndSelect('seen_user.user', 'user')
        .getMany();

      return users;
    } catch (error) {
      console.log('receivedUsers Error', error);
    }
  }
}
