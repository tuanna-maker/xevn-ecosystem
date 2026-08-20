"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const dotenv_1 = __importDefault(require("dotenv"));
function loadMonorepoEnv() {
    const apiRoot = process.cwd();
    const repoRoot = (0, node_path_1.resolve)(apiRoot, '..', '..', '..');
    const deployDir = (0, node_path_1.resolve)(repoRoot, 'deploy', 'xevn-ecosystem');
    const deployExample = (0, node_path_1.resolve)(deployDir, '.env.example');
    const deployEnv = (0, node_path_1.resolve)(deployDir, '.env');
    const deployLocal = (0, node_path_1.resolve)(deployDir, '.env.local');
    const localEnv = (0, node_path_1.resolve)(apiRoot, '.env');
    if ((0, node_fs_1.existsSync)(deployEnv)) {
        dotenv_1.default.config({ path: deployEnv });
    }
    else if ((0, node_fs_1.existsSync)(deployExample)) {
        dotenv_1.default.config({ path: deployExample });
    }
    if ((0, node_fs_1.existsSync)(deployLocal))
        dotenv_1.default.config({ path: deployLocal, override: true });
    if ((0, node_fs_1.existsSync)(localEnv))
        dotenv_1.default.config({ path: localEnv, override: true });
}
loadMonorepoEnv();
//# sourceMappingURL=load-env.js.map