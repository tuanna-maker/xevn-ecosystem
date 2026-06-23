#!/usr/bin/env node
import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'xevn_xbos',
  ssl: false,
});

const upd = await pool.query(
  `UPDATE xbos_workflow_step_task
   SET assignee_user_id = 'ceo@xe.vn'
   WHERE assignee_user_id = 'ceo@xevn.vn'
     AND status = 'pending'`,
);
console.log('updated_rows', upd.rowCount);

const counts = await pool.query(
  `SELECT assignee_user_id, count(*)::int AS pending_count
   FROM xbos_workflow_step_task t
   JOIN xbos_workflow_instance i ON i.id = t.instance_id
   WHERE i.business_type = 'hrm_catalog_extension'
     AND t.status = 'pending'
   GROUP BY assignee_user_id`,
);
console.log('pending_by_assignee', JSON.stringify(counts.rows));
await pool.end();
