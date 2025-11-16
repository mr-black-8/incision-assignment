import express from 'express';
import { Server } from 'http';
import { Context } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createServer, proxy } from 'aws-serverless-express';
import { AppModule } from './app.module';

let server: Server;

async function bootstrap(): Promise<Server> {
  const expressApp = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.enableCors({
    origin: '*', // or your CloudFront domain
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Incision Assesment: Catalog')
    .setDescription('Catalog of items with AI suggestions')
    .setVersion('0.1')
    .build();
  const docFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, docFactory);

  await app.init();

  if (process.env.NODE_ENV === 'local') {
    await new Promise<void>(resolve => app.listen(process.env.PORT ?? 3000, resolve));
  }

  return createServer(expressApp);
}

export async function handler(event: any, context: Context) {
  if (!server) {
    server = await bootstrap();
  }

  return proxy(server, event, context, 'PROMISE').promise;
}

if (process.env.NODE_ENV === 'local') {
  bootstrap();
}