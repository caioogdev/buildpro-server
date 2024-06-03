import { PrismaClient } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';

const prisma = new PrismaClient();

class CompanyController {
  async createCompany(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { name } = request.body as any;

      const company = await prisma.company.create({
        data: {
          name,
        },
      });

      reply.status(201).send({message: "Empresa criada com sucesso"});
    } catch (error) {
      reply.status(500).send({ error: error });
    }
  }

  async showCompanies(request: FastifyRequest, reply: FastifyReply) {
    try {
      const companies = await prisma.company.findMany({
        include: {
          users: true,
        },
      });

      reply.status(200).send(companies);
    } catch (error) {
      reply.status(500).send({ error: error });
    }
  }
}

export const companyController = new CompanyController();
