import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';

const prisma = new PrismaClient();

class UserController {
  async createUser(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, cpf, password, companyIds, role } = request.body as any;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashedPassword,
        role,
        isActive: true,
        companies: {
          create: companyIds.map((companyId: string) => ({
            company: {
              connect: { id: companyId },
            },
          })),
        },
      },
    });

    reply.status(201).send(user);
  }

  async showUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await prisma.user.findMany({
        select: {
          name: true,
          email: true,
          role: true,
          companies: {
            select: {
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      reply.status(200).send(users);
    } catch (error) {
      reply.status(500).send({ error: error });
    }
  }
}

export const userController = new UserController();
