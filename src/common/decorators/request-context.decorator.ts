import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {Request } from "express"

export interface IReqCtx {
  ip: string;
}

export const ReqCtx = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IReqCtx => {
    const request: Request = ctx.switchToHttp().getRequest();
    const ip = request.headers["x-ip"] as string;

    return { ip };
  }
);
