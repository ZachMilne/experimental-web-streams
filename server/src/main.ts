import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = 3003;
  await app.listen(port);
  console.log('serving on port: ', port);
}
bootstrap();
