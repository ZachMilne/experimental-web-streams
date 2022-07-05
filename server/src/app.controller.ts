import { Controller, Get, Post, Res, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { WrtcConnections } from './wrtc/wrtcConnections';
import { Request, Response } from 'express';
import { opendir, open } from 'fs/promises';
import * as fs from 'fs';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly wrtcConnections: WrtcConnections,
  ) {}

  @Get('files')
  async getFiles() {
    const dir = await opendir('./uploads');

    const files = [];
    for await (let entry of dir) {
      const file = await open(`${dir.path}/${entry.name}`, 'r');
      const { size, birthtime } = await file.stat();
      const [name, uuid] = entry.name.split('_uuid_');
      files.push({
        docId: entry.name,
        uuid,
        name,
        size,
        createdAt: birthtime
      });
      file.close();
    }

    return files;
  }

  @Get('file')
  async getFile(
    @Res() response: Response,
    @Query() query
  ) {
    const fileStream = fs.createReadStream(`./uploads/${query.docId}`);
    fileStream.pipe(response);
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
