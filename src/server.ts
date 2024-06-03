import Fastify from 'fastify';
import { appRoutes } from './start/routes';
import * as dotenv from 'dotenv';
import fastifyCors from '@fastify/cors';

dotenv.config();

const fastify = Fastify({ logger: true });

// Configuração do CORS
fastify.register(fastifyCors, { 
  origin: '*'
});

fastify.register(appRoutes);

const start = async () => {
  try {
    await fastify.listen({ 
      port: parseInt(process.env.PORT as string, 10) || 3000, 
      host: process.env.HOST || 'localhost'
    });
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
