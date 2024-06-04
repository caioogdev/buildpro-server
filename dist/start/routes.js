"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
const UserRoutes_1 = require("../app/Modules/User/Routes/UserRoutes");
const CompanyRoutes_1 = require("../app/Modules/Company/Routes/CompanyRoutes");
const AuthRoutes_1 = require("../app/Modules/User/Routes/AuthRoutes");
async function appRoutes(fastify) {
    fastify.register(UserRoutes_1.UserRoutes);
    fastify.register(CompanyRoutes_1.CompanyRoutes);
    fastify.register(AuthRoutes_1.AuthRoutes);
}
exports.appRoutes = appRoutes;
