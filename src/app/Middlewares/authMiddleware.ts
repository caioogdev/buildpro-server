import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    role: string;
    companies: {
      id: string;
      name: string;
    }[];
  };
}

export async function authMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return reply.status(401).send({ error: 'Token de acesso inválido ou inexistente' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    request.user = decoded;
  } catch (error) {
    return reply.status(403).send({ error: 'Token inválido' });
  }
}