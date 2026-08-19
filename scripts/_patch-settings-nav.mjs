import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = path.join(root, 'apps/web/hrm/src/pages/Settings.tsx');
let s = fs.readFileSync(p, 'utf8');

if (s.includes('<TabsList')) {
  s = s.replace(
    /      <Tabs defaultValue=\{settingsTab\} key=\{settingsTab\} className="space-y-4">\s*<TabsList[\s\S]*?<\/TabsList>\s*/,
    '      <SettingsNavLayout activeTab={settingsTab} onSelectTab={selectSettingsTab}>\n',
  );
}

s = s.replace(
  /        \{settingsTab === 'contract-legal' && \(<div className="space-y-4">\n          <ContractLegalPrintSettingsPanel \/>\n          <MergeTokenSettingsPanel \/>\n        <\/div>\)\}/,
  `        {settingsTab === 'contract-clauses' && (
          <div className="space-y-4">
            <ContractLegalPrintSettingsPanel view="clauses" />
          </div>
        )}
        {settingsTab === 'contract-templates' && (
          <div className="space-y-4">
            <ContractLegalPrintSettingsPanel view="templates" />
          </div>
        )}
        {settingsTab === 'contract-number-config' && (
          <div className="space-y-4">
            <ContractLegalPrintSettingsPanel view="number-config" />
          </div>
        )}
        {settingsTab === 'contract-library-publish' && (
          <div className="space-y-4">
            <ContractLegalPrintSettingsPanel view="library-publish" />
          </div>
        )}
        {settingsTab === 'merge-tokens' && (
          <div className="space-y-4">
            <MergeTokenSettingsPanel />
          </div>
        )}`,
);

s = s.replace(
  /import \{ Tabs, TabsContent, TabsList, TabsTrigger \} from '@\/components\/ui\/tabs';\n/,
  '',
);

fs.writeFileSync(p, s);
console.log('fixed', p, 'has TabsList', s.includes('TabsList'));
