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
  UpdateUserDto,
} from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { SeenUser } from 'src/entities/seen_user.entity';
import { SeenUserDto } from './dto/user.dto';
import { ErrorMessage } from 'src/common/constants';
import { FileUploadService } from 'src/external/cloudinary.external';
import { REQUESTUSER } from 'src/common/enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SeenUser)
    private seenUser: Repository<SeenUser>,
    @InjectRedis() private readonly redisService: Redis,
    private readonly configService: ConfigService,
    private fileUploadService: FileUploadService,
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

  async updateUser(
    userId: string,
    updateDto: UpdateUserDto,
    files: { images?: Express.Multer.File[] },
  ) {
    try {
      console.log('updateUser', files);
      const user = await this.userRepository.findOne({
        where: { id: Number(userId) },
      });
      if (!user) {
        throw new Error('User not found');
      }
      let responseUploadedUrls = null;
      if (files?.images) {
        responseUploadedUrls = await this.fileUploadService.uploadImage(
          files?.images,
        );
      }
      console.log('respneUrl', responseUploadedUrls);
      await this.userRepository.update(userId, {
        ...updateDto,
        images: responseUploadedUrls,
      });

      return await this.userRepository.findOne({
        where: { id: Number(userId) },
      });
    } catch (err) {
      console.error('updateUser error:', err);
      throw err;
    }
  }

  async getUsers(userId: string) {
    try {
      return await this.userRepository.findOne({
        where: { id: Number(userId) },
      });
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

  async filterUsers(
    userId: string,
    filter: FilterUsersDto,
    limit: number = 20,
  ): Promise<User[]> {
    try {
      const seenUsersKey = `user:${userId}:actionUsers`;

      const radius = 900;

      let seenUserIds: any = await this.redisService.smembers(seenUsersKey);
      if (!seenUserIds.length) {
        seenUserIds = await this.seenUser
          .createQueryBuilder('seen_user')
          .select('seen_user."seen_user_id"')
          .where('seen_user."userId" = :userId', { userId })
          .getRawMany();
        seenUserIds = seenUserIds.map(
          (result: { seen_user_id: any }) => result.seen_user_id,
        );
      }
      if (seenUserIds.length) {
        await this.redisService.sadd(`user:${userId}:actionUsers`, seenUserIds);
      }

      // const getSeenRequestUser = await this.seenUser.findOne({where:{status:REQUESTUSER.REQUESTED},relations: ['seenUser'] , select:['seenUser']})

      const getSeenRequestUser = await this.seenUser.findOne({
        where: { status: REQUESTUSER.REQUESTED },
        relations: ['seenUser'],
        select: ['seenUser'],
      });

      if (getSeenRequestUser) {
        limit = 19;
      }

      const { longitude, latitude } = await this.userRepository
        .createQueryBuilder('user')
        .select('user.longitude', 'longitude')
        .addSelect('user.latitude', 'latitude')
        .where('user.id = :userId', { userId })
        .getRawOne();

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

      query
        .addSelect(
          'earth_distance(ll_to_earth(:latitude, :longitude),ll_to_earth(user.latitude, user.longitude))',
          'distance',
        )
        .setParameter('latitude', latitude)
        .setParameter('longitude', longitude)
        .andWhere(
          'earth_distance(ll_to_earth(:latitude, :longitude), ll_to_earth(user.latitude, user.longitude)) <= :radius',
          { latitude, longitude, radius },
        )
        .addSelect('user.id', 'id')
        .addSelect('user.username', 'username')
        .addSelect('user.email', 'email')
        .addSelect('user.dateOfBirth', 'dateOfBirth')
        .addSelect('user.gender', 'gender')
        .addSelect('user.location', 'location')
        .addSelect('user.profilePicture', 'profilePicture')
        .addSelect('user.images', 'images')
        .addSelect('user.bio', 'bio')
        .addSelect('user.education_level', 'education_level')
        .addSelect('user.dating_goal', 'dating_goal')
        .addSelect('user.interests', 'interests')
        .addSelect('user.languages', 'languages')
        .addSelect('user.height', 'height')
        .addSelect('user.latitude', 'latitude')
        .addSelect('user.longitude', 'longitude')
        .limit(limit);

      const getFilterdUsers = await query.getRawMany();

      if (getSeenRequestUser) {
        const randomIndex = Math.floor(
          Math.random() * (getFilterdUsers.length + 1),
        );
        getFilterdUsers.splice(randomIndex, 0, getSeenRequestUser.seenUser);
      }

      // const usersRandomized = MathgetFilterdUsers.length

      return getFilterdUsers;
    } catch (err) {
      console.log('filterUsers Err', err);
    }
  }

  async actionUser(userId: string, seenUserDto: SeenUserDto) {
    try {
      const seenUsersKey = `user:${userId}:actionUsers`;
      await this.redisService.sadd(seenUsersKey, seenUserDto.seen_user_id);
      await this.seenUser.save({ userId, ...seenUserDto });
    } catch (error) {
      if (error?.code === '23505') {
        throw ErrorMessage.userError.duplicateRequest;
      }
      console.log('actionUser errrror', error);
      throw error;
    }
  }

  async sentUsers(userId: string) {
    try {
      // const users = await this.seenUser
      //   .createQueryBuilder('seen_user')
      //   .where('seen_user."userId" IS NOT NULL')
      //   .andWhere('seen_user."userId" =:userId', { userId })
      //   .leftJoinAndSelect('seen_user.seenUser', 'user')
      //   .getMany();

      const { longitude, latitude } = await this.userRepository
      .createQueryBuilder('user')
      .select('user.longitude', 'longitude')
      .addSelect('user.latitude', 'latitude')
      .where('user.id = :userId', { userId })
      .getRawOne();

      const users = await this.seenUser
      .createQueryBuilder('seen_user')
      .where('seen_user."userId" IS NOT NULL')
      .andWhere('seen_user."userId" = :userId', { userId })
      .select([
        'user.id as id',
        'user.username as username',
        'user.email as email',
        'user.dateOfBirth as dateOfBirth',
        'user.gender as gender',
        'user.location as location',
        'user.profilePicture as profilePicture',
        'user.images as images',
        'user.bio as bio',
        'user.education_level as education_level',
        'user.dating_goal as dating_goal',
        'user.interests as interests',
        'user.languages as languages',
        'user.height as height',
        'user.latitude as latitude',
        'user.longitude as longitude',
      ])
      .leftJoin('seen_user.seenUser', 'user')
      .addSelect(
        'earth_distance(ll_to_earth(:latitude, :longitude),ll_to_earth(user.latitude, user.longitude))',
        'distance',
      )
      .setParameter('latitude', latitude)
      .setParameter('longitude', longitude)
      .getRawMany();

  

      return users;
    } catch (error) {
      console.log('receivedUsers Error', error);
      throw error;
    }
  }

  async receivedUsers(
    userId: string,
    filter: ReceviedUsersDto,
    limit: number = 20,
  ) {
    try {
      // const users = await this.seenUser
      //   .createQueryBuilder('seen_user')
      //   .where('seen_user.userId IS NOT NULL')
      //   .andWhere('seen_user.userId =:userId', { userId })
      //   .andWhere('seen_user.status = :status', { status: filter.status })
      //   .leftJoinAndSelect('seen_user.user', 'user')
      //   .getMany();

      const users = await this.seenUser
        .createQueryBuilder('seen_user')
        .where('seen_user.userId IS NOT NULL')
        .andWhere('seen_user.seen_user_id =:userId', { userId })
        .andWhere('seen_user.status = :status', { status: filter.status })
        .leftJoinAndSelect('seen_user.user', 'user')
        .limit(limit)
        .getMany();

      return users;
    } catch (error) {
      console.log('receivedUsers Error', error);
      throw error;
    }
  }
}
