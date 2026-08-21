const { Client } = require('pg');
const client = new Client('postgresql://app1:5^S0CEpvYwC1(%23YN1UoJ@113.20.107.184:6432/xevn_hrm');
client.connect()
  .then(() => client.query(`SELECT COUNT(*) FROM public.payroll_payslips`))
  .then(res => console.log(res.rows))
  .then(() => client.end())
  .catch(console.error);
