import { FastifyInstance } from 'fastify';
import { userController } from '../Controllers/UserController';

export async function UserRoutes(fastify: FastifyInstance) {
  fastify.post('/users', userController.createUser.bind(userController));
  fastify.get('/users', userController.showUsers.bind(userController));
}
