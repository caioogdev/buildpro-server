import { FastifyInstance } from 'fastify';
import { companyController } from '../Controllers/CompanyController';

export async function CompanyRoutes(fastify: FastifyInstance) {
  fastify.post('/companies', companyController.createCompany.bind(companyController));
  fastify.get('/companies', companyController.showCompanies.bind(companyController));
}
