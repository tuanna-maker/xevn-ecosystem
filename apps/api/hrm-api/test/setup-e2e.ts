import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../../../../deploy/xevn-ecosystem/.env'),
});
dotenv.config({ path: path.resolve(__dirname, '../.env') });
