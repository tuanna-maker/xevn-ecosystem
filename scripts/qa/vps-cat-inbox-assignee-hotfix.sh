#!/bin/sh
set -e
cd /opt/xevn-ecosystem/deploy/xevn-ecosystem
set -a
. ./.env
set +a
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d xevn_xbos -v ON_ERROR_STOP=1 <<'SQL'
UPDATE xbos_workflow_step_task
SET assignee_user_id = 'ceo@xe.vn'
WHERE assignee_user_id = 'ceo@xevn.vn'
  AND status = 'pending';
SELECT assignee_user_id, count(*) AS pending_count
FROM xbos_workflow_step_task t
JOIN xbos_workflow_instance i ON i.id = t.instance_id
WHERE i.business_type = 'hrm_catalog_extension'
  AND t.status = 'pending'
GROUP BY assignee_user_id;
SQL
