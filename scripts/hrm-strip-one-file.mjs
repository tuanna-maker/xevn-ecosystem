import fs from 'node:fs';

const p = process.argv[2];
if (!p) {
  console.error('Usage: node hrm-strip-one-file.mjs <path>');
  process.exit(1);
}
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/import \{ supabase \} from '@\/integrations\/supabase\/client';\n/, '');
c = c.replace(/const \{ data, error \} = await supabase[\s\S]*?;\n\n/g, () => '');
c = c.replace(/const \{ error \} = await supabase[\s\S]*?;\n/g, '');
c = c.replace(/await supabase[\s\S]*?;\n/g, '');
c = c.replace(/supabase\.from\([^)]+\)[\s\S]*?;/g, '');
if (!c.includes('notifyHrmApiGap')) {
  const idx = c.indexOf("import { useSystemRoles }");
  if (idx !== -1) {
    c = c.replace(
      "import { useSystemRoles }",
      "import { notifyHrmApiGap } from '@/lib/hrmApiGap';\nimport { useSystemRoles }",
    );
  }
}
fs.writeFileSync(p, c);
console.log('stripped', p);
