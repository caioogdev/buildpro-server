// src/controllers/AuthController.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION!;

class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as any;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
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

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.status(401).send({
        status: 'error',
        message: 'Email ou senha inválido',
      });
    }

    const companies = user.companies.map((userCompany) => ({
      id: userCompany.company.id,
      name: userCompany.company.name,
    }));

    const token = jwt.sign(
      { userId: user.id, role: user.role, companies },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    await prisma.token.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseDuration(REFRESH_TOKEN_EXPIRATION)),
      },
    });

    return reply.send({
      status: 'success',
      message: 'Login efetuado com sucesso.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companies,
        },
        token,
        refreshToken,
      },
    });
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.body as any;

    if (!refreshToken) {
      return reply.status(400).send({
        status: 'error',
        message: 'Refresh token é obrigatório',
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;
      const tokenRecord = await prisma.token.findFirst({
        where: { token: refreshToken },
        include: {
          user: {
            include: {
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
          },
        },
      });

      if (!tokenRecord || tokenRecord.userId !== decoded.userId || tokenRecord.expiresAt < new Date()) {
        return reply.status(401).send({
          status: 'error',
          message: 'Refresh Token expirado ou inválido',
        });
      }

      const companies = tokenRecord.user.companies.map((userCompany) => ({
        id: userCompany.company.id,
        name: userCompany.company.name,
      }));

      const newToken = jwt.sign(
        { userId: tokenRecord.user.id, role: tokenRecord.user.role, companies },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      const newRefreshToken = jwt.sign(
        { userId: tokenRecord.user.id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRATION }
      );

      await prisma.token.create({
        data: {
          token: newRefreshToken,
          userId: tokenRecord.user.id,
          expiresAt: new Date(Date.now() + parseDuration(REFRESH_TOKEN_EXPIRATION)),
        },
      });

      return reply.send({
        status: 'success',
        message: 'Token renovado com sucesso.',
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      return reply.status(401).send({
        status: 'error',
        message: 'Refresh Token inválido',
      });
    }
  }
}

export const authController = new AuthController();

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)([smhd])/);
  if (!match) {
    throw new Error('Invalid duration format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error('Unidade de duração inválida');
  }
}
