const { Pool } = require('pg');
const pool = new Pool({
  host: '113.20.107.184',
  port: 6432,
  user: 'app1',
  password: '5^S0CEpvYwC1(#YN1UoJ',
  database: 'xevn_xbos',
  ssl: false
});

pool.query(`
  SELECT m.tenant_id, m.role_code, t.name, t.short_name, t.tenant_kind, t.default_company_id
  FROM public.xbos_user_tenant_membership m
  JOIN public.xbos_tenant_registry t ON t.tenant_id = m.tenant_id
  WHERE m.user_id = 'admin@xe.vn' AND m.status = 'active' AND t.status = 'active'
`)
  .then(res => console.log('Rows:', res.rows.length))
  .catch(err => console.error('Error:', err.message))
  .finally(() => pool.end());
