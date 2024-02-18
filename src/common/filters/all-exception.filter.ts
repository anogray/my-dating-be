import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Logger } from '../logging/Logger';
import { Request, Response } from 'express';
import { ErrorMessage } from '../constants/error.message';

interface customException {
  timestamp: string;
  message: string;
  httpStatus: number;
  customErrorNumber: number;
  query?: string;
}
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  logger: Logger;

  constructor() {
    this.logger = new Logger('HttpExceptionFilter');
  }

  catch(err: customException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const tag = request.url;
    if (!err) err = ErrorMessage.systemError.oopsSomethingWentWrong;
    if (err.query) err = ErrorMessage.systemError.oopsSomethingWentWrong;

    const errorObj = err;
    void response.status(err?.httpStatus || 400).send(errorObj);
    this.logger.error(err, { tag, data: err });
    this.logger.logRoute(request, response, { ...err });
  }
}
