// Excel spreadsheet parsing for financial data extraction
import * as XLSX from 'xlsx';
import * as fs from 'fs';

export interface ExcelSheet {
  name: string;
  rows: any[][];
  headers: string[];
}

export interface ParsedExcelData {
  sheets: ExcelSheet[];
  metadata: {
    sheetCount: number;
    totalRows: number;
  };
}

export class ExcelParser {
  /**
   * Parse Excel workbook from buffer using xlsx library
   */
  async parseFromBuffer(buffer: ArrayBuffer): Promise<ParsedExcelData> {
    console.log('📊 Parsing Excel workbook...');
    
    try {
      // Convert ArrayBuffer to Buffer for xlsx
      const nodeBuffer = Buffer.from(buffer);
      
      // Parse the workbook
      const workbook = XLSX.read(nodeBuffer, { type: 'buffer' });
      
      const sheets: ExcelSheet[] = [];
      let totalRows = 0;
      
      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          continue;
        }
        
        // First row as headers
        const headers = jsonData[0]?.map(h => String(h || '')) || [];
        
        // Remaining rows as data
        const rows = jsonData.slice(1);
        
        sheets.push({
          name: sheetName,
          headers,
          rows
        });
        
        totalRows += rows.length;
      }
      
      console.log(`✅ Excel parsed: ${sheets.length} sheets, ${totalRows} total rows`);
      
      return {
        sheets,
        metadata: {
          sheetCount: sheets.length,
          totalRows
        }
      };
    } catch (error) {
      console.error('❌ Failed to parse Excel:', error);
      // Return empty result on failure
      return {
        sheets: [],
        metadata: {
          sheetCount: 0,
          totalRows: 0
        }
      };
    }
  }

  /**
   * Parse Excel file from path
   */
  async parseFromFile(filePath: string): Promise<ParsedExcelData> {
    console.log(`📊 Parsing Excel from: ${filePath}`);
    
    try {
      // Read file
      const fileBuffer = await fs.promises.readFile(filePath);
      
      // Convert to ArrayBuffer
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      ) as ArrayBuffer;
      
      return await this.parseFromBuffer(arrayBuffer);
    } catch (error) {
      console.error(`❌ Failed to read Excel file ${filePath}:`, error);
      return {
        sheets: [],
        metadata: {
          sheetCount: 0,
          totalRows: 0
        }
      };
    }
  }

  /**
   * Extract financial metrics from Excel data
   */
  extractFinancialMetrics(data: ParsedExcelData): any {
    const metrics: any = {
      totalTransactions: 0,
      totalAmount: 0
    };

    for (const sheet of data.sheets) {
      metrics.totalTransactions += sheet.rows.length;
      
      // Sum amounts if amount column exists
      const amountIndex = sheet.headers.findIndex(h => 
        h.toLowerCase().includes('amount') || h.toLowerCase().includes('value')
      );
      
      if (amountIndex >= 0) {
        for (const row of sheet.rows) {
          const amount = parseFloat(row[amountIndex]);
          if (!isNaN(amount)) {
            metrics.totalAmount += amount;
          }
        }
      }
    }

    return metrics;
  }
}
