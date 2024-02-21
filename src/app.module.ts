import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { UserModule } from './modules/user/user.module';
import { PostgresModule } from './config/database/postgres.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PostgresModule,
    UserModule,
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      }),
    }),
    ConfigModule.forRoot({ envFilePath: ['.env'], isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
