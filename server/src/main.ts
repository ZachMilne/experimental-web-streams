import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { mkdirSync, existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  app.enableCors();
  if (!existsSync('./uploads')) mkdirSync('./uploads');
  const port = 3003;
  await app.listen(port);
  console.log('serving on port: ', port);
}
bootstrap();
