"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const AuthController_1 = require("../Controllers/AuthController");
async function AuthRoutes(fastify) {
    fastify.post('/login', AuthController_1.authController.login.bind(AuthController_1.authController));
}
exports.AuthRoutes = AuthRoutes;
