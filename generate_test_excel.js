const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const data = [
  // 1. Valid row
  {
    "CLIENT NAME": "John Doe",
    "PROPERTY ADDRESS": "123 Main St",
    "REALTOR": "Jane Smith",
    "EFFECTIVE DAY": "9/15", // Ambiguous date (needs default year)
    "CLOSING DAY": "10/30/2026",
    "LOAN TYPE": "Conventional",
    "EBBA": "True",
    "CONTRACT": "True",
    "FHA/VA": "False",
    "INSPECTION": "True"
  },
  // 2. Missing Client and Address (should be ignored)
  {
    "REALTOR": "Ghost Agent",
    "LOAN TYPE": "Cash",
    "EBBA": "False"
  },
  // 3. Only False values (should be ignored)
  {
    "CLIENT NAME": "Empty Row",
    "PROPERTY ADDRESS": "404 Nowhere",
    "EBBA": "False",
    "CONTRACT": "False",
    "INSPECTION": "False"
  },
  // 4. Duplicate client name, different address (New Transaction)
  {
    "CLIENT NAME": "John Doe",
    "PROPERTY ADDRESS": "456 Oak St",
    "EFFECTIVE DAY": "2026-08-01",
    "CONTRACT": "True"
  },
  // 5. Exact duplicate of row 1 (for testing re-import rules)
  {
    "CLIENT NAME": "John Doe",
    "PROPERTY ADDRESS": "123 Main St",
    "REALTOR": "Jane Smith",
    "EFFECTIVE DAY": "9/15",
    "CLOSING DAY": "10/30/2026",
    "LOAN TYPE": "Conventional",
    "EBBA": "True",
    "CONTRACT": "True",
    "FHA/VA": "False",
    "INSPECTION": "True"
  },
  // 6. Changed row: Same client and address, different Closing Day
  {
    "CLIENT NAME": "John Doe",
    "PROPERTY ADDRESS": "123 Main St",
    "EFFECTIVE DAY": "9/15",
    "CLOSING DAY": "11/05/2026", // changed
    "CONTRACT": "True"
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

const outDir = 'c:\\Project\\smart-close-app\\docs\\reference';
const outPath = path.join(outDir, 'synthetic_test.xlsx');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

XLSX.writeFile(wb, outPath);
console.log('Synthetic Excel file generated at ' + outPath);
