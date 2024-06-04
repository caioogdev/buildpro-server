"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CompanyController {
    async createCompany(request, reply) {
        try {
            const { name } = request.body;
            const company = await prisma.company.create({
                data: {
                    name,
                },
            });
            reply.status(201).send({ message: "Empresa criada com sucesso" });
        }
        catch (error) {
            reply.status(500).send({ error: error });
        }
    }
    async showCompanies(request, reply) {
        try {
            const companies = await prisma.company.findMany({
                include: {
                    users: true,
                },
            });
            reply.status(200).send(companies);
        }
        catch (error) {
            reply.status(500).send({ error: error });
        }
    }
}
exports.companyController = new CompanyController();
