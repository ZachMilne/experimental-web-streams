import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { WrtcConnections } from './wrtc/wrtcConnections';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly wrtcConnections: WrtcConnections,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('download')
  async download(
    @Req() request: Request,
    @Res() response: Response,
    @Body() body,
  ) {
    //console.log(body);
  }

  @Post('negotiate')
  async negotiate(@Body() body) {
    const answer = await this.wrtcConnections.handleOffer(
      body.connectionId,
      body.offer,
    );

    return answer;
  }
}
