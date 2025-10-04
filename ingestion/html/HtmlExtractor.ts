// HTML document extraction for web-based legal documents
import * as cheerio from 'cheerio';

export interface ExtractedHTMLContent {
  text: string;
  links: string[];
  tables: any[];
  metadata: {
    title?: string;
    description?: string;
  };
}

export class HtmlExtractor {
  /**
   * Extract content from HTML string using cheerio
   */
  extractFromHTML(html: string): ExtractedHTMLContent {
    console.log('🌐 Extracting HTML content...');
    
    try {
      // Load HTML with cheerio
      const $ = cheerio.load(html);
      
      // Extract metadata
      const title = $('title').text() || $('h1').first().text() || 'HTML Document';
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || 
                         'Extracted content';
      
      // Extract text content (remove script and style tags)
      $('script, style, noscript').remove();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      
      // Extract links
      const links = this.extractLinksFromDOM($);
      
      // Extract tables
      const tables = this.extractTablesFromDOM($);
      
      console.log(`✅ HTML extracted: ${text.length} characters, ${links.length} links, ${tables.length} tables`);
      
      return {
        text,
        links,
        tables,
        metadata: {
          title,
          description
        }
      };
    } catch (error) {
      console.error('❌ Failed to parse HTML:', error);
      // Fallback to basic extraction
      return {
        text: this.stripHTMLTags(html),
        links: [],
        tables: [],
        metadata: {
          title: 'HTML Document',
          description: 'Extraction error - using fallback'
        }
      };
    }
  }

  /**
   * Extract plain text from HTML, removing tags (fallback method)
   */
  private stripHTMLTags(html: string): string {
    // Basic tag stripping (fallback when cheerio fails)
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Extract all links from HTML using cheerio
   */
  private extractLinksFromDOM($: cheerio.Root): string[] {
    const links: string[] = [];
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        links.push(href);
      }
    });
    
    return links;
  }

  /**
   * Extract tables from HTML
   */
  private extractTablesFromDOM($: cheerio.Root): any[] {
    const tables: any[] = [];
    
    $('table').each((tableIndex, tableElement) => {
      const rows: any[][] = [];
      
      $(tableElement).find('tr').each((_, rowElement) => {
        const cells: string[] = [];
        
        $(rowElement).find('td, th').each((_, cellElement) => {
          cells.push($(cellElement).text().trim());
        });
        
        if (cells.length > 0) {
          rows.push(cells);
        }
      });
      
      if (rows.length > 0) {
        tables.push({
          index: tableIndex,
          rows,
          headers: rows[0] || []
        });
      }
    });
    
    return tables;
  }

  /**
   * Fetch and extract content from URL
   */
  async fetchAndExtract(url: string): Promise<ExtractedHTMLContent> {
    console.log(`🌐 Fetching HTML from: ${url}`);
    
    // Note: In a production environment, you would use fetch or axios here
    // For now, this is a placeholder since we don't have network access
    console.warn('⚠️  URL fetching not implemented - use extractFromHTML with file content');
    return this.extractFromHTML('<html><body>Sample content</body></html>');
  }

  /**
   * Extract content from HTML file
   */
  async extractFromFile(filePath: string): Promise<ExtractedHTMLContent> {
    console.log(`🌐 Extracting HTML from file: ${filePath}`);
    
    try {
      const fs = await import('fs');
      const html = await fs.promises.readFile(filePath, 'utf-8');
      return this.extractFromHTML(html);
    } catch (error) {
      console.error(`❌ Failed to read HTML file ${filePath}:`, error);
      return {
        text: `Failed to read HTML file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        links: [],
        tables: [],
        metadata: {
          title: 'Error Reading HTML',
          description: 'File read error'
        }
      };
    }
  }
}
