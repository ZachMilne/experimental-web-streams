import { Controller, Get, Post, Req, Res, Body, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { WrtcConnections } from './wrtc/wrtcConnections';
import { Request, Response } from 'express';
import { opendir, open } from 'fs/promises';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
