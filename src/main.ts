import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './exception-handler/global.exception.filter';
import { Seeder } from './modules/seeders/seedder.';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

  // Check required environment variables
  const requiredEnvVars = ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });

  // Uncaught exception and unhandled rejection handlers
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  const app = await NestFactory.create(AppModule);

  app.use(morgan(process.env.MORGAN_FORMAT || 'dev'));

  app.useGlobalPipes(new ValidationPipe({
    transformOptions: {
      enableImplicitConversion: true
    }
  }));

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors( new ClassSerializerInterceptor(reflector) );

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.useGlobalFilters(new GlobalExceptionFilter());

  // console.log('Running seeder...');
  // const seeder = app.get(Seeder);
  // await seeder.run();

  const config = new DocumentBuilder()
    .setTitle('Post Simulator API')
    .setDescription(`This is an example of a REST API in NestJS that simulates the operation of a CRUD for Posts, adding and replying comments, where comments can have N number of replies. This project is used to test the operation of TypeORM, including LAZY and EAGER queries, and interface handling.`)
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();