const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function inspectWebsite() {
    try {
        const today = new Date();
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const startDate = '01-12-2024'; // Recent date
        const endDate = formatDate(today);
        
        const url = `https://www.ketquadientoan.com/tat-ca-ky-xo-so-mega-6-45.html?datef=${startDate}&datet=${endDate}`;
        console.log('Fetching data from:', url);
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        // Save the HTML to a file for inspection
        fs.writeFileSync('website.html', response.data);
        console.log('HTML saved to website.html');
        
        // Try different selectors to find the table
        console.log('\n=== Checking for different table structures ===');
        
        // Check for any tables
        const tables = $('table');
        console.log(`Found ${tables.length} tables`);
        
        tables.each((i, table) => {
            const $table = $(table);
            const classes = $table.attr('class') || 'no-class';
            const id = $table.attr('id') || 'no-id';
            console.log(`Table ${i}: class="${classes}", id="${id}"`);
            
            // Check first few rows
            const rows = $table.find('tr');
            console.log(`  Rows: ${rows.length}`);
            
            if (rows.length > 0) {
                rows.slice(0, 3).each((j, row) => {
                    const cols = $(row).find('td, th');
                    if (cols.length > 0) {
                        const cellTexts = [];
                        cols.each((k, col) => {
                            cellTexts.push($(col).text().trim());
                        });
                        console.log(`    Row ${j}: [${cellTexts.join(', ')}]`);
                    }
                });
            }
            console.log('');
        });
        
        // Check for specific classes that might contain results
        console.log('\n=== Checking for result-related elements ===');
        const resultElements = $('.result, .kq, .ketqua, [class*="result"], [class*="kq"]');
        console.log(`Found ${resultElements.length} result-related elements`);
        
        resultElements.each((i, el) => {
            const $el = $(el);
            const classes = $el.attr('class') || 'no-class';
            const tag = $el.prop('tagName').toLowerCase();
            console.log(`Element ${i}: ${tag}.${classes}`);
            console.log(`  Text: ${$el.text().trim().substring(0, 100)}...`);
        });
        
        // Try the original selector
        console.log('\n=== Original selector results ===');
        const originalResults = $('table.table-mini-result tr');
        console.log(`Original selector found ${originalResults.length} rows`);
        
        // Try alternative selectors
        console.log('\n=== Alternative selectors ===');
        const alternatives = [
            'table tr',
            '.table tr',
            '[class*="table"] tr',
            '[class*="result"] tr',
            'tbody tr',
            '.kq tr'
        ];
        
        alternatives.forEach(selector => {
            const elements = $(selector);
            console.log(`${selector}: ${elements.length} elements`);
            
            if (elements.length > 0 && elements.length < 20) {
                elements.slice(0, 3).each((i, row) => {
                    const cols = $(row).find('td');
                    if (cols.length >= 3) {
                        const cellTexts = [];
                        cols.slice(0, 4).each((j, col) => {
                            cellTexts.push($(col).text().trim());
                        });
                        console.log(`  Sample row: [${cellTexts.join(', ')}]`);
                    }
                });
            }
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspectWebsite(); 
