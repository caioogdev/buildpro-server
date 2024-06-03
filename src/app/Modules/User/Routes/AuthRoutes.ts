import { FastifyInstance } from 'fastify';
import { authController } from '../Controllers/AuthController';

export async function AuthRoutes(fastify: FastifyInstance) {
  fastify.post('/login', authController.login.bind(authController));
}
