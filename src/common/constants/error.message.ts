export class ErrorMessage {
    static errorMessage(
      message: string,
      status: number,
      customErrorNumber: number,
    ) {
      return {
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        message: message,
        status: status,
        customErrorNumber: customErrorNumber,
      };
    }
    static uuidErr(id: string) {
      return {
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        message: `invalid id ${id}`,
        status: 400,
        customErrorNumber: -3,
      };
    }
    static dynamicMsgErr(message: string) {
      return {
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        message: message,
        status: 400,
        customErrorNumber: -9,
      };
    }
  
    public static systemError: any = {
      invalidRequest: this.errorMessage('Invalid Request', 400, 0),
      oopsSomethingWentWrong: this.errorMessage(
        'Oops! Something went wrong',
        500,
        -1,
      ),
      externalProviderIssue: this.errorMessage(
        'Please try in some time!',
        400,
        -5,
      ),
    }; // -1000000 to 99999
  
    public static userError:any={
      duplicateRequest: this.errorMessage('Duplicate request', 409, -99999),
      invalidCredentials:this.errorMessage('Invalid credentials',400,-99998),
      updateUserDtoEmpty:this.errorMessage('Oops! Something went wrong',400,-99997),
      removeProfileImageInvalid:this.errorMessage('Oops! Something went wrong',400,-99996),
      imagenotFound:this.errorMessage('Image does not exists',400,-99995),
      numberImagesLimit:this.errorMessage('Please remove some images',400,-99994),
      userNotFound:this.errorMessage('Not Found',400,-99993)
    };//-99999 to =89999

  }
  