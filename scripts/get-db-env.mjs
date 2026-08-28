import { loadMigrateEnv } from './migrate-env-loader.mjs';
loadMigrateEnv('hrm');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME_HRM || 'xevn_hrm');
