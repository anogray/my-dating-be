import {
  Injectable,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigurationService } from 'src/config/config.service';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
// import streamifier from 'streamifier';
import * as streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';
import { userImages } from '../common/enums/user.enum';

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
//   });
//   cloudinary.config({
//     cloud_name: "doyezmfiw",
//     api_key: "328476417741913",
//     api_secret: "8Jmr4TJDM5C1aYX9fQY6OKNPgK0"
//   });

export class FileUploadService {
  constructor(private configService: ConfigurationService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImageToCloudinary(
    buffer: Buffer,
    fileDetails: any,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'users',
          upload_preset: 'ml_default',
          public_id: fileDetails.filename,
          filename_override: fileDetails.filename,
        },
        (error: Error, result: UploadApiResponse) => {
          if (result) resolve(result);
          else reject(error);
        },
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }
  async uploadImage(Files: Express.Multer.File[]) {
    try {
      let setUploadedImagePromises = [];

      for (const file of Files) {
        setUploadedImagePromises.push(
          this.uploadImageToCloudinary(file.buffer, {
            filename: `${file.originalname.split('.')[0]}_${uuidv4()}`,
            format: userImages[userImages[file.mimetype]],
          }),
        );
      }

      const uploadedResponse = await Promise.all(setUploadedImagePromises);

      return uploadedResponse.map((resp) => resp.secure_url);
    } catch (error) {
      console.log('uploadImage error', error);
    }
  }
}
