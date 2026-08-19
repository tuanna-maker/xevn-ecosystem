/**
 * Rename OneDrive stub xevn folders; ensure C:\xevn-ecosystem junction is the SoT path.
 * Creates Desktop + projects-folder shortcuts to the junction.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const od = 'C:/Users/ADMIN/OneDrive';
const junction = 'C:\\xevn-ecosystem';

const hits = [];
for (const name of fs.readdirSync(od)) {
  const repo = path.join(od, name, 'Vibe Coding', 'projects', 'xevn-ecosystem');
  if (!fs.existsSync(repo)) continue;
  const pkg = fs.existsSync(path.join(repo, 'package.json'));
  const git = fs.existsSync(path.join(repo, '.git'));
  const web = fs.existsSync(path.join(repo, 'apps', 'web'));
  hits.push({ name, repo, pkg, git, web, full: pkg && git && web });
}

console.log('hits:', hits.map((h) => ({ name: h.name, full: h.full, repo: h.repo })));

const full = hits.find((h) => h.full);
if (!full) {
  console.error('NO_FULL_REPO');
  process.exit(2);
}
if (!fs.existsSync(path.join(junction, 'package.json'))) {
  console.error('JUNCTION_BROKEN', junction);
  process.exit(3);
}
console.log('FULL=', full.repo);
console.log('JUNCTION_OK=', junction);

for (const s of hits.filter((h) => !h.full)) {
  const parent = path.dirname(s.repo);
  const dest = path.join(parent, 'xevn-ecosystem__STUB_DO_NOT_USE');
  if (path.resolve(s.repo) === path.resolve(full.repo)) continue;
  if (fs.existsSync(dest)) {
    console.log('STUB_DEST_EXISTS skip', dest);
    // if stub still at xevn-ecosystem name, leave note
    continue;
  }
  try {
    fs.renameSync(s.repo, dest);
    console.log('RENAMED', s.repo, '->', dest);
  } catch (e) {
    console.log('RENAME_FAIL', s.repo, e.message);
  }
}

function makeShortcut(lnkPath, target) {
  const psPath = path.join(junction, 'tmp-mk-lnk.ps1');
  const body = [
    '$WshShell = New-Object -ComObject WScript.Shell',
    `$s = $WshShell.CreateShortcut(${JSON.stringify(lnkPath)})`,
    `$s.TargetPath = ${JSON.stringify(target)}`,
    `$s.WorkingDirectory = ${JSON.stringify(target)}`,
    `$s.Description = 'XeVN FULL monorepo via C:\\xevn-ecosystem (avoid OneDrive stub)'`,
    '$s.Save()',
    'Write-Host SHORTCUT_OK $s.FullName',
  ].join('\n');
  fs.writeFileSync(psPath, body, 'utf8');
  execFileSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', psPath],
    { stdio: 'inherit' },
  );
  try {
    fs.unlinkSync(psPath);
  } catch {
    /* ignore */
  }
}

const desktop = path.join(process.env.USERPROFILE || '', 'Desktop');
makeShortcut(path.join(desktop, 'xevn-ecosystem.lnk'), junction);
makeShortcut(path.join(path.dirname(full.repo), 'xevn-ecosystem FULL.lnk'), junction);

// README drop next to stub if renamed
for (const name of fs.readdirSync(od)) {
  const stub = path.join(od, name, 'Vibe Coding', 'projects', 'xevn-ecosystem__STUB_DO_NOT_USE');
  if (!fs.existsSync(stub)) continue;
  const readme = path.join(stub, 'README_DO_NOT_USE.md');
  fs.writeFileSync(
    readme,
    [
      '# STUB — DO NOT USE',
      '',
      'This folder is an incomplete OneDrive duplicate (Unicode path collision).',
      '',
      '**Open the full repo via:**',
      '',
      '- `C:\\xevn-ecosystem` (junction)',
      '- Desktop shortcut `xevn-ecosystem.lnk`',
      '- Cursor: File → Open Folder → `C:\\xevn-ecosystem`',
      '',
      'See `docs/program/WORKSPACE_PATH_RECOVERY.md` in the full repo.',
      '',
    ].join('\n'),
    'utf8',
  );
  console.log('STUB_README', readme);
}

console.log('DONE');
