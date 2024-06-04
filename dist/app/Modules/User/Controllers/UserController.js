"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class UserController {
    async createUser(request, reply) {
        const { name, email, cpf, password, companyIds, role } = request.body;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                cpf,
                password: hashedPassword,
                role,
                isActive: true,
                companies: {
                    create: companyIds.map((companyId) => ({
                        company: {
                            connect: { id: companyId },
                        },
                    })),
                },
            },
        });
        reply.status(201).send(user);
    }
    async showUsers(request, reply) {
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
        }
        catch (error) {
            reply.status(500).send({ error: error });
        }
    }
}
exports.userController = new UserController();
