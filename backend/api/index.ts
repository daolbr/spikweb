import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import type { Request, Response } from 'express';
import { AppModule } from '../src/app.module';

// Handler serverless para o Vercel. A instância do Nest é criada uma vez
// e reaproveitada entre invocações "quentes" da função (cold start só
// acontece na primeira chamada após um período ocioso).
const expressApp = express();
let appPronto: Promise<void> | null = null;

async function inicializar() {
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');
  await app.init();
}

export default async function handler(req: Request, res: Response) {
  if (!appPronto) appPronto = inicializar();
  await appPronto;
  expressApp(req, res);
}
