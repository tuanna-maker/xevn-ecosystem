import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const INPUT_DIR = path.resolve('docs', 'từ khách hàng');
const OUTPUT_FILE = path.resolve('docs', 'program', 'Master_Data_XEVN.xlsx');

const TARGET_FILES = {
  'Personnel': 'Danh_Muc_Nhan_Su_XE.xlsx',
  'Timesheets': 'Cham_Cong_Nghi_Phep_XE.xlsx',
  'Payroll_Policy': 'Cau_Hinh_Luong_XE_FULL.xlsx'
};

async function run() {
  console.log('Starting Excel refactoring...');
  
  // Create a new workbook
  const masterWb = XLSX.utils.book_new();

  for (const [category, filename] of Object.entries(TARGET_FILES)) {
    const filePath = path.join(INPUT_DIR, filename);
    if (fs.existsSync(filePath)) {
      console.log(`Processing ${filename}...`);
      try {
        const fileData = fs.readFileSync(filePath);
        const wb = XLSX.read(fileData, { type: 'buffer' });
        
        // We will just take the first sheet of each file for simplicity, 
        // or we can take all sheets and append the category name.
        for (const sheetName of wb.SheetNames) {
          const sheet = wb.Sheets[sheetName];
          let newSheetName = `${category}_${sheetName}`.substring(0, 31); // Excel sheet name limit is 31 chars
          
          // Optionally, read and clean data here before appending
          const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          
          // Example of filtering PII: (If the user requested, we could delete columns here)
          // For now, we keep all data intact as requested.
          
          const cleanSheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(masterWb, cleanSheet, newSheetName);
          console.log(`  -> Added sheet: ${newSheetName}`);
        }
      } catch (err) {
        console.error(`Error processing ${filename}:`, err.message);
      }
    } else {
      console.warn(`[WARNING] File not found: ${filePath}`);
    }
  }

  // Also try to find KPI in Gói P.CNTT folder
  const kpiFolder = path.join(INPUT_DIR, 'Gói P.CNTT');
  if (fs.existsSync(kpiFolder)) {
    const files = fs.readdirSync(kpiFolder);
    const kpiFile = files.find(f => f.includes('KPI') && f.endsWith('.xlsx'));
    if (kpiFile) {
      console.log(`Processing KPI file: ${kpiFile}...`);
      const kpiPath = path.join(kpiFolder, kpiFile);
      const fileData = fs.readFileSync(kpiPath);
      const wb = XLSX.read(fileData, { type: 'buffer' });
      for (const sheetName of wb.SheetNames) {
        const sheet = wb.Sheets[sheetName];
        let newSheetName = `KPI_${sheetName}`.substring(0, 31);
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const cleanSheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(masterWb, cleanSheet, newSheetName);
        console.log(`  -> Added sheet: ${newSheetName}`);
      }
    }
  }

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  if (!masterWb.SheetNames.length) {
    console.error("No sheets were added. Aborting write.");
    return;
  }

  // Write to output file
  const outData = XLSX.write(masterWb, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync(OUTPUT_FILE, outData);
  console.log(`\nSuccessfully created master file at: ${OUTPUT_FILE}`);
}

run();
