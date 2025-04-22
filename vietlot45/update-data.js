const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const DATA_FILE = path.join(__dirname, 'vietlot45-data.json');
const BASE_URL = 'https://www.ketquadientoan.com/tat-ca-ky-xo-so-mega-6-45.html';

async function fetchData() {
    try {
        // Get today's date in DD-MM-YYYY format
        const today = new Date();
        
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const startDate = '01-01-2016'; // Fixed start date
        const endDate = formatDate(today);
        
        const url = `${BASE_URL}?datef=${startDate}&datet=${endDate}`;
        console.log('Fetching data from:', url);
        
        const response = await axios.get(url);
        console.log('Response status:', response.status);
        
        const $ = cheerio.load(response.data);
        
        // Debug: Log all tables found
        console.log('Number of tables found:', $('table').length);
        $('table').each((i, table) => {
            console.log(`Table ${i + 1} classes:`, $(table).attr('class'));
        });
        
        const results = [];
        // Try different table selectors
        const selectors = [
            'table.table-striped',
            'table.table',
            'table',
            '#content table',
            '.table-responsive table'
        ];
        
        let foundTable = false;
        for (const selector of selectors) {
            console.log(`Trying selector: ${selector}`);
            $(selector + ' tr').each((i, row) => {
                const cols = $(row).find('td');
                if (cols.length >= 3) {
                    const date = $(cols[0]).text().trim();
                    const numbers = $(cols[1]).text()
                        .trim()
                        .split(/\s+/)  // Split by any whitespace
                        .filter(n => n !== "")  // Remove empty strings
                        .slice(0, 6)  // Take only first 6 numbers
                        .join(" ");  // Join with single space
                    const prize = $(cols[2]).text().trim();
                    
                    if (date && numbers && prize) {
                        results.push({
                            date,
                            numbers,
                            prize
                        });
                        foundTable = true;
                    }
                }
            });
            if (foundTable) {
                console.log(`Found data using selector: ${selector}`);
                break;
            }
        }

        console.log('Fetched', results.length, 'records');
        if (results.length > 0) {
            console.log('Sample record:', results[0]);
        } else {
            // Debug: Log a portion of the HTML to see the structure
            console.log('HTML content sample:', $('body').html().substring(0, 1000));
        }
        return results;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return [];
    }
}

async function updateLocalData() {
    try {
        console.log('Starting update process...');
        console.log('Data file path:', DATA_FILE);
        
        // Read existing data
        let existingData = [];
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            existingData = JSON.parse(fileContent);
            console.log('Existing records:', existingData.length);
        } else {
            console.log('No existing data file found');
        }

        // Get latest date from existing data
        let latestDate = null;
        if (existingData.length > 0) {
            // Parse Vietnamese date format (e.g., "CN, 16/03/2025")
            const dateStr = existingData[0].date.split(', ')[1]; // Get "16/03/2025"
            const [day, month, year] = dateStr.split('/');
            latestDate = new Date(`${year}-${month}-${day}`);
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        
        console.log('Latest date in data:', latestDate);
        console.log('Today:', today);

        // Always fetch new data for now to test
        console.log('Fetching new data...');
        const newData = await fetchData();
        
        if (newData.length > 0) {
            console.log('New records:', newData.length);
            // Merge new data with existing data
            const updatedData = [...newData, ...existingData];
            
            // Remove duplicates based on date
            const uniqueData = updatedData.filter((item, index, self) =>
                index === self.findIndex((t) => t.date === item.date)
            );
            
            console.log('Total unique records:', uniqueData.length);
            
            // Save to file
            fs.writeFileSync(DATA_FILE, JSON.stringify(uniqueData, null, 2));
            console.log('Data updated successfully');
        } else {
            console.log('No new data fetched');
        }
    } catch (error) {
        console.error('Error updating data:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the update
updateLocalData(); 
