"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalArtifactUrl = exports.resolveInDir = exports.timestampId = exports.ensureDir = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const ensureDir = async (dirPath) => {
    await promises_1.default.mkdir(dirPath, { recursive: true });
};
exports.ensureDir = ensureDir;
const timestampId = () => {
    const now = new Date();
    const clean = now.toISOString().replace(/[:.]/g, '-');
    return `run-${clean}`;
};
exports.timestampId = timestampId;
const resolveInDir = (dir, filename) => path_1.default.join(dir, filename);
exports.resolveInDir = resolveInDir;
const getLocalArtifactUrl = (relativePath) => {
    const cleanPath = relativePath.replace(/^\/+/, '');
    return `http://localhost:${config_1.config.port}/artifacts/${cleanPath}`;
};
exports.getLocalArtifactUrl = getLocalArtifactUrl;
