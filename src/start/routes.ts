import { FastifyInstance } from 'fastify';
import { UserRoutes } from '../app/Modules/User/Routes/UserRoutes';
import { CompanyRoutes } from '../app/Modules/Company/Routes/CompanyRoutes';
import { AuthRoutes } from '../app/Modules/User/Routes/AuthRoutes';

export async function appRoutes(fastify: FastifyInstance) {
  fastify.register(UserRoutes);
  fastify.register(CompanyRoutes);
  fastify.register(AuthRoutes);
}
