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
const fastify_1 = __importDefault(require("fastify"));
const routes_1 = require("./start/routes");
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("@fastify/cors"));
dotenv.config();
const fastify = (0, fastify_1.default)({ logger: true });
// Configuração do CORS
fastify.register(cors_1.default, {
    origin: '*'
});
fastify.register(routes_1.appRoutes);
const start = async () => {
    try {
        await fastify.listen({
            port: parseInt(process.env.PORT, 10) || 3000,
            host: process.env.HOST || 'localhost'
        });
        console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
