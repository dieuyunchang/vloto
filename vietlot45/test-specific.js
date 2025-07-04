const axios = require('axios');
const cheerio = require('cheerio');

async function testSpecificFormat() {
    try {
        const today = new Date();
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const startDate = '01-12-2024';
        const endDate = formatDate(today);
        
        const url = `https://www.ketquadientoan.com/tat-ca-ky-xo-so-mega-6-45.html?datef=${startDate}&datet=${endDate}`;
        console.log('Fetching data from:', url);
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        console.log('=== Analyzing table.table-mini-result rows ===');
        
        const results = [];
        $('table.table-mini-result tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 3) {
                console.log(`\nRow ${i}:`);
                console.log(`  Columns found: ${cols.length}`);
                
                cols.each((j, col) => {
                    const $col = $(col);
                    const text = $col.text().trim();
                    const html = $col.html();
                    console.log(`  Column ${j}:`);
                    console.log(`    Text: "${text}"`);
                    console.log(`    HTML: "${html}"`);
                    
                    // If this is column 1 (numbers), try different parsing methods
                    if (j === 1) {
                        console.log('    Parsing numbers:');
                        
                        // Method 1: Split by whitespace and filter
                        const method1 = text.split(/\s+/).filter(n => n !== "" && /^\d+$/.test(n));
                        console.log(`    Method 1 (split whitespace): [${method1.join(', ')}]`);
                        
                        // Method 2: Extract all numbers using regex
                        const method2 = text.match(/\d+/g) || [];
                        console.log(`    Method 2 (regex \\d+): [${method2.join(', ')}]`);
                        
                        // Method 3: Look for specific number patterns
                        const method3 = text.match(/\b\d{1,2}\b/g) || [];
                        console.log(`    Method 3 (1-2 digits): [${method3.join(', ')}]`);
                    }
                });
                
                // Try to parse this row
                if (cols.length >= 3) {
                    const date = $(cols[0]).text().trim();
                    const numbersCol = $(cols[1]).text().trim();
                    const prize = $(cols[2]).text().trim();
                    
                    // Parse numbers using different methods
                    const numbers1 = numbersCol.split(/\s+/).filter(n => n !== "" && /^\d+$/.test(n));
                    const numbers2 = numbersCol.match(/\b\d{1,2}\b/g) || [];
                    
                    console.log(`  Parsed result:`);
                    console.log(`    Date: "${date}"`);
                    console.log(`    Numbers method 1: [${numbers1.join(', ')}]`);
                    console.log(`    Numbers method 2: [${numbers2.join(', ')}]`);
                    console.log(`    Prize: "${prize}"`);
                    
                    if (date && numbers2.length === 6 && prize) {
                        results.push({
                            date,
                            numbers: numbers2.join(' '),
                            prize
                        });
                    }
                }
                
                // Only analyze first 3 data rows
                if (i >= 3) return false;
            }
        });
        
        console.log('\n=== Final Results ===');
        console.log(`Found ${results.length} valid results:`);
        results.forEach((result, i) => {
            console.log(`${i + 1}. Date: ${result.date}, Numbers: ${result.numbers}, Prize: ${result.prize}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSpecificFormat(); 
