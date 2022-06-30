import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WrtcConnections } from './wrtc/wrtcConnections';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WrtcConnections],
})
export class AppModule {}
