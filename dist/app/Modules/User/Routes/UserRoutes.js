"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const UserController_1 = require("../Controllers/UserController");
async function UserRoutes(fastify) {
    fastify.post('/users', UserController_1.userController.createUser.bind(UserController_1.userController));
    fastify.get('/users', UserController_1.userController.showUsers.bind(UserController_1.userController));
}
exports.UserRoutes = UserRoutes;
