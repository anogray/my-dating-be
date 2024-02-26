import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { SeenUser } from 'src/entities/seen_user.entity';
import { FileUploadService } from 'src/external/cloudinary.external';

@Module({
  imports: [TypeOrmModule.forFeature([User,SeenUser])],
  controllers: [UserController],
  providers: [UserService, JwtService,FileUploadService],
  exports:[UserService]
})
export class UserModule {}
