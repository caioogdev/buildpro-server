"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRoutes = void 0;
const CompanyController_1 = require("../Controllers/CompanyController");
async function CompanyRoutes(fastify) {
    fastify.post('/companies', CompanyController_1.companyController.createCompany.bind(CompanyController_1.companyController));
    fastify.get('/companies', CompanyController_1.companyController.showCompanies.bind(CompanyController_1.companyController));
}
exports.CompanyRoutes = CompanyRoutes;
