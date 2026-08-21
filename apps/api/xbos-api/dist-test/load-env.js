"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMonorepoRoot = findMonorepoRoot;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const dotenv_1 = __importDefault(require("dotenv"));
function moduleDir() {
    return __dirname;
}
/** Resolve monorepo root when cwd is package dir, repo root, or compiled dist/. */
function findMonorepoRoot() {
    const candidates = [
        process.cwd(),
        (0, node_path_1.resolve)(process.cwd(), '..', '..', '..'),
        (0, node_path_1.resolve)(moduleDir(), '..', '..', '..'),
        (0, node_path_1.resolve)(moduleDir(), '..', '..', '..', '..'),
    ];
    for (const root of candidates) {
        const deployDir = (0, node_path_1.resolve)(root, 'deploy', 'xevn-ecosystem');
        if ((0, node_fs_1.existsSync)((0, node_path_1.resolve)(deployDir, '.env')) || (0, node_fs_1.existsSync)((0, node_path_1.resolve)(deployDir, '.env.example'))) {
            return root;
        }
    }
    return (0, node_path_1.resolve)(process.cwd(), '..', '..', '..');
}
/**
 * Nạp deploy/xevn-ecosystem/.env (chung DB + Supabase) trước, rồi .env của xbos-api (override).
 */
function loadMonorepoEnv() {
    const apiRoot = process.cwd();
    const repoRoot = findMonorepoRoot();
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
