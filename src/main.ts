import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,    // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // rechaza con 400 si vienen campos extra
      transform: true,    // transforma los tipos (@Type(() => Date), etc.)
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();