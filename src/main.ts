import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from "./common/filters/all-exception.filter";
import "dotenv/config"
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import cors from 'cors'

async function bootstrap() {
  try{

    dotenv.config(); 
    const app = await NestFactory.create(AppModule,{cors:{origin:'*'}});
    // app.enableCors({
  
    //   origin:"*"
      
    //   });
      
    // app.use(cors())
    // app.use(cors({
    //   origin: process.env.FRONTEND_ORIGIN || 'http://localhost:19002',
    //   credentials: true, // Allow cookies for authentication
    // }));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
  
  
    await app.listen(3000);
  }catch(err){
    console.log("errorMainFxn",err,err?.message)
  }
}
bootstrap();
