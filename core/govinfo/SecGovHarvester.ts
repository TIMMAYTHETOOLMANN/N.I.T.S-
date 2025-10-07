/**
 * JUNI: SEC.gov Harvester
 * Compliant with SEC rate limits and User-Agent requirements
 */

import axios from 'axios';
import { RateLimiter } from 'limiter';

export class SecGovHarvester {
  private rateLimiter = new RateLimiter({
    tokensPerInterval: 9,
    interval: 'second'
  });

  private readonly headers = {
    'User-Agent': 'NITS System admin@company.com', // ⚠️ UPDATE THIS
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'www.sec.gov'
  };

  async fetchFilingIndex(cik: string, year: number): Promise<any> {
    await this.rateLimiter.removeTokens(1);

    const paddedCIK = cik.padStart(10, '0');
    const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${paddedCIK}&type=&dateb=&owner=exclude&count=100&output=atom`;

    try {
      console.log(`📡 Fetching SEC filings: CIK ${paddedCIK}, Year ${year}`);

      const resp = await axios.get(url, {
        headers: this.headers,
        timeout: 30000
      });

      console.log(`✅ SEC data retrieved: ${resp.data?.length || 0} bytes`);
      return resp.data;
    } catch (err: any) {
      if (err.response?.status === 403) {
        console.error('🚫 SEC.gov blocked request - check rate limit and User-Agent');
      }
      console.warn(`⚠️  SEC fetch error: CIK ${paddedCIK}`, err.message);
      return null;
    }
  }

  async fetchFilingDocument(accessionNumber: string): Promise<string | null> {
    await this.rateLimiter.removeTokens(1);

    const formatted = accessionNumber.replace(/-/g, '');
    const url = `https://www.sec.gov/Archives/edgar/data/${formatted}`;

    try {
      const resp = await axios.get(url, {
        headers: this.headers,
        timeout: 30000
      });
      return resp.data;
    } catch (err: any) {
      console.warn(`⚠️  Failed to fetch filing ${accessionNumber}:`, err.message);
      return null;
    }
  }
}
