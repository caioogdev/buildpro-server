"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
// src/controllers/AuthController.ts
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION;
class AuthController {
    async login(request, reply) {
        const { email, password } = request.body;
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
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return reply.status(401).send({
                status: 'error',
                message: 'Email ou senha inválido',
            });
        }
        const companies = user.companies.map((userCompany) => ({
            id: userCompany.company.id,
            name: userCompany.company.name,
        }));
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role, companies }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
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
    async refreshToken(request, reply) {
        const { refreshToken } = request.body;
        if (!refreshToken) {
            return reply.status(400).send({
                status: 'error',
                message: 'Refresh token é obrigatório',
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
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
            const newToken = jsonwebtoken_1.default.sign({ userId: tokenRecord.user.id, role: tokenRecord.user.role, companies }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            const newRefreshToken = jsonwebtoken_1.default.sign({ userId: tokenRecord.user.id }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
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
        }
        catch (error) {
            return reply.status(401).send({
                status: 'error',
                message: 'Refresh Token inválido',
            });
        }
    }
}
exports.authController = new AuthController();
function parseDuration(duration) {
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
