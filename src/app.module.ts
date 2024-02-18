import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
// import { UserService } from './modules/user/user.service';
import { PostgresModule } from './config/database/postgres.module';
import { UserController } from './modules/user/user.controller';

@Module({
  imports: [PostgresModule,
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
