import pg from 'pg';
import { loadDeployEnv } from '../../../../../d:/xevn-ecosystem/scripts/seed-env-loader.mjs';
loadDeployEnv();

const { Client } = pg;
const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: '5^S0CEpvYwC1(#YN1UoJ',
  database: 'xevn_hrm',
  ssl: false,
});

async function run() {
  await client.connect();
  console.log('Connected to DB');
  
  await client.query('ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS workflow_instance_id uuid;');
  console.log('Altered table job_postings: added workflow_instance_id');
  
  await client.end();
}

run().catch(console.error);
