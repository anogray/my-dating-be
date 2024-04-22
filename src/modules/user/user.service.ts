import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { User } from 'src/entities/user.entity';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import {
  CreateUserDto,
  FilterUsersDto,
  LikeRejectUserDto,
  MessageDto,
  ReceviedUsersDto,
  UpdateUserDto,
} from './dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { SeenUser } from 'src/entities/seen_user.entity';
import { SeenUserDto } from './dto/user.dto';
import { ErrorMessage } from 'src/common/constants';
import { FileUploadService } from 'src/external/cloudinary.external';
import { LikeRejectUser, REQUESTUSER } from 'src/common/enums/user.enum';
import { EmailService } from '../../external/email.service';
import { Message } from 'src/entities/message.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SeenUser)
    private seenUser: Repository<SeenUser>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRedis() private readonly redisService: Redis,
    private readonly configService: ConfigService,
    private fileUploadService: FileUploadService,
    private emailService: EmailService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const getUser = JSON.parse(
        await this.redisService.getex(`register_${createUserDto['otp']}`),
      );
      const email = createUserDto['otp']
        ? getUser.email
        : createUserDto['email'];
      const password = createUserDto['otp']
        ? getUser.password
        : createUserDto['password'];

      if (getUser && createUserDto.otp === getUser.otp) {
        const partialUser: DeepPartial<User> = {
          email: getUser.email,
          password: getUser.password,
        };
        const newUser = this.userRepository.create(partialUser);
        return await this.userRepository.save(newUser);
      } else {
        const getOtp = await this.emailService.sendEmail('bbncr97@gmail.com');
        await this.redisService.setex(
          `register_${getOtp}`,
          30,
          JSON.stringify({ email: email, password: password, otp: getOtp }),
        );
        const getUserE = JSON.parse(
          await this.redisService.getex(`register_${getOtp}`),
        );
        return `Please check your email and verify the otp `;
      }
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
      const allFieldsUndefined = Object.values(updateDto).every(
        (value) => value === undefined,
      );
      if (allFieldsUndefined && !files?.images) {
        throw ErrorMessage.userError.updateUserDtoEmpty;
      }

      const user = await this.userRepository.findOne({
        where: { id: Number(userId) },
      });
      if (!user) {
        throw ErrorMessage.userError.userNotFound;
      }
      if (user.images?.length > 5) {
        throw ErrorMessage.userError.numberImagesLimit;
      }
      let responseUploadedUrls = null;
      if (files?.images) {
        responseUploadedUrls = await this.fileUploadService.uploadImage(
          files?.images,
        );
      }

      const updatedUserData: DeepPartial<User> = { ...updateDto };

      if (responseUploadedUrls && responseUploadedUrls.length > 0) {
        updatedUserData.images = user.images
          ? [...user.images, ...responseUploadedUrls]
          : responseUploadedUrls;
      }
      console.log('respneUrl', responseUploadedUrls, updatedUserData);

      // await this.userRepository.update(userId, {
      //   ...updateDto,
      //   images: responseUploadedUrls,
      // });

      await this.userRepository.update(userId, updatedUserData);

      return await this.userRepository.findOne({
        where: { id: Number(userId) },
      });
    } catch (err) {
      console.error('updateUser error:', err);
      throw err;
    }
  }

  async removeProfileImage(userId: string, image_url: string) {
    try {
      if (!image_url) {
        throw ErrorMessage.userError.removeProfileImageInvalid;
      }

      const result = await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({ images: () => `array_remove(images, '${image_url}')` })
        .where('id = :userId', { userId })
        .andWhere(`'${image_url}' = ANY(images)`)
        .execute();

      if (result.affected === 0) {
        throw ErrorMessage.userError.imagenotFound;
      }
    } catch (err) {
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
      where: [{ email: usernameOrEmail }],
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

      const radius = 90000000;

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
        where: { status: REQUESTUSER.LIKED, seen_user_id: userId },
        relations: ['userA'],
        select: ['userA'],
      });

      if (getSeenRequestUser) {
        limit = 19;
        seenUserIds = [...seenUserIds, getSeenRequestUser.userA.id];
      }

      console.log({ getSeenRequestUser });

      const { longitude, latitude } = await this.userRepository
        .createQueryBuilder('user')
        .select('user.longitude', 'longitude')
        .addSelect('user.latitude', 'latitude')
        .where('user.id = :userId', { userId })
        .getRawOne();

      const query = this.userRepository.createQueryBuilder('user');

      query
        .where('user.id != :userId', { userId })
        .andWhere('user.yob IS NOT NULL');

      console.log({ filter, longitude, latitude });
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
        .addSelect('user.email', 'email')
        .addSelect('user.yob', 'yob')
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
        getFilterdUsers.splice(randomIndex, 0, getSeenRequestUser.userA);
      }
      // const usersRandomized = MathgetFilterdUsers.length

      return getFilterdUsers;
    } catch (err) {
      console.log('filterUsers Err', err);
    }
  }

  // async actionUser(userId: string, seenUserDto: SeenUserDto) {
  async actionUser(userId: string, seenUserDto: LikeRejectUserDto) {
    try {
      const userAction = await this.seenUser.findOne({
        where: [
          {
            userId: seenUserDto.userId,
            seen_user_id: userId,
            status: REQUESTUSER.LIKED,
          },
        ],
      });

      //update as matched
      if (userAction) {
        //update user request if already exists then match
        const seenUsersKey = `user:${userId}:actionUsers`;
        await this.redisService.sadd(seenUsersKey, seenUserDto.userId);
        const updateStatus =
          seenUserDto.status == LikeRejectUser.LIKED
            ? REQUESTUSER.MATCHED
            : REQUESTUSER.REJECTED;

        const updateRequest = await this.seenUser.update(
          { id: userAction.id },
          {
            status: updateStatus,
          },
        );
        //update user request if already exists then create that user also
        await this.seenUser.save({
          userId,
          seen_user_id: seenUserDto.userId,
          status: updateStatus,
        });

        //initiate the chat seesion userid and seen_user_id
      } else {
        const seenUsersKey = `user:${userId}:actionUsers`;
        await this.redisService.sadd(seenUsersKey, seenUserDto.userId);
        console.log('savingAction', { userId, ...seenUserDto });
        await this.seenUser.save({
          userId,
          seen_user_id: seenUserDto.userId,
          status: seenUserDto.status,
        });
      }
    } catch (error) {
      if (error?.code === '23505') {
        throw ErrorMessage.userError.duplicateRequest;
      }
      console.log('actionUser errrror', error);
      throw error;
    }
  }

  async likeUser(userId: string, seenUserDto: SeenUserDto) {
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
        .andWhere('seen_user.status=:status', { status: 'LIKED' })
        .select([
          'user.id as id',
          'user.username as username',
          'user.email as email',
          'user.yob as yob',
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

  async postMessage(body: MessageDto) {
    try {
      // const newMessage = new Message();
      // newMessage.senderId = userId;
      // newMessage.recipientId = body.userId;
      // newMessage.content = body.content;
      console.log('postMessage', body);
      return await this.messageRepository.save(body);
    } catch (err) {
      console.log('postMessage', err);
      throw err;
    }
  }

  async userChat(
    senderId: string,
    recipientId: string,
    page: number,
    limit: number,
  ) {
    try {

      const messages = await this.messageRepository.find({
        where: [
          { senderId: senderId, recipientId: recipientId }, // User 1 sent to User 2
          { senderId: recipientId, recipientId: senderId }, // User 2 sent to User 1
        ],
        order: { createdDate: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      return messages;
    } catch (err) {
      console.log('userChat', err);
      throw err;
    }
  }

  async allChats(userId:string, limit:number=20, page: number=1){
    try{

      const qb = this.seenUser
      .createQueryBuilder('seen_user')
      .where('seen_user."userId" = :userId', { userId:Number(userId) })
      .andWhere('seen_user.status = :status', { status: REQUESTUSER.MATCHED }) // Assuming 'like' indicates a match
      .leftJoin('seen_user.seenUser', 'user')
      .addSelect('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.yob', 'yob')
      .addSelect('user.gender', 'gender')
      .addSelect('user.location', 'location')
      .addSelect('user.images', 'images')
      .addSelect('user.bio', 'bio')
      .addSelect('user.education_level', 'education_level')
      .addSelect('user.dating_goal', 'dating_goal')
      .addSelect('user.interests', 'interests')
      .addSelect('user.languages', 'languages')
      .addSelect('user.height', 'height')
      .addSelect('user.latitude', 'latitude')
      .addSelect('user.longitude', 'longitude')
      .orderBy('seen_user.createdDate', 'DESC'); 

    const totalUsers = await qb.getCount(); // Get total matched users
    const totalPages = Math.ceil(totalUsers / limit); // Calculate total pages
    
    qb.skip((page - 1) * limit)
      .take(limit);

    
    const matchedUsers = await qb.getRawMany();
    console.log({matchedUsers})
    return {users:matchedUsers.map((matchedUser) => matchedUser),totalPages, limit, page}
    }catch(err){
      console.log("allChats err",err);
      throw err;
    }
  }
}
