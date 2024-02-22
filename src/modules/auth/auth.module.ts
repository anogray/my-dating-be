import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigService and ConfigModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Use configService to get JWT_SECRET
        signOptions: { expiresIn: '24h' }, // Token expiration time
      }),
      inject: [ConfigService], // Inject ConfigService into the factory function
    }),
    UserModule
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
