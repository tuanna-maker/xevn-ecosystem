# Disaster Recovery (P2.2)

## Backup

```bash
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -Fc xevn_hrm > backup-hrm-$(date +%F).dump
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -Fc xevn_xbos > backup-xbos-$(date +%F).dump
```

Cron VPS: nightly 02:00, retention 14 days off-host.

## Restore drill (quarterly)

1. Restore vào DB tạm `xevn_hrm_restore_test`.
2. `pnpm migrate:hrm:status` against restore.
3. Smoke `node scripts/mobile-hrm-smoke.mjs`.
4. Ghi log drill vào `docs/qa/`.

## Read replica (khi có)

- Reports/KPI rollup → connection string `DATABASE_URL_HRM_REPLICA`.
- Failover: runbook manual promote replica (managed PG khi lên cloud).

## RTO / RPO mục tiêu pilot

| | Target |
|--|--------|
| RPO | 24h (nightly backup) |
| RTO | 4h (manual restore + redeploy) |
