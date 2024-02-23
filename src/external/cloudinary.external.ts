import {
    Injectable,
    ServiceUnavailableException,
    InternalServerErrorException,
  } from '@nestjs/common';
import { ConfigurationService } from 'src/config/config.service';

// import {v2 as cloudinary} from 'cloudinary';


  export class FileUploadService {

    constructor(private configService: ConfigurationService) { }

    async uploadImage(File: Express.Multer.File) {
        try{

        }catch(error){
            console.log("uploadImage error",error);
        }
    }

  }