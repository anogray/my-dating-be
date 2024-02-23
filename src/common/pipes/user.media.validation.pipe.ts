import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ErrorMessage } from '../constants';
import { userImages } from '../enums/user.enum';

@Injectable()
export class UserMediaImageValidation implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const allowedProfileSize = 2;
    // const uploadAllowed = +process.env.MAX_UPLOAD_SIZE_MB * 1000 * 1000;
    // Validate banner image size
    console.log("checkvalue",value)
    if (value?.images) {
      if (value?.images[0].size > allowedProfileSize * 1000 * 1000) {
        throw ErrorMessage.errorMessage(
          `Please upload profile image that is not more than ${allowedProfileSize}MB in size.`,
          400,
          1000,
        );
      }

      // validate image type
      if (!(value?.images[0]?.mimetype in userImages)) {
        throw ErrorMessage.errorMessage(
          `Please provide profile image of type JPG/JPEG/PNG/GIF`,
          400,
          1002,
        );
      }

    }

    return value;
  }
}
