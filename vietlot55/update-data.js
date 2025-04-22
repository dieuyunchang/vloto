const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const DATA_FILE = path.join(__dirname, 'vietlot55-data.json');
const BASE_URL = 'https://www.ketquadientoan.com/tat-ca-ky-xo-so-power-655.html';

async function fetchData() {
    try {
        // Get today's date in DD-MM-YYYY format
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        };

        const startDate = '03-12-2019'; // Fixed start date
        const endDate = formatDate(today);
        
        const url = `${BASE_URL}?datef=${startDate}&datet=${endDate}`;
        console.log('Fetching data from:', url);
        
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        
        const results = [];
        $('table tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 4) {
                const date = $(cols[0]).text().trim();
                const numbers = $(cols[1]).text()
                    .trim()
                    .split(/\s+/)  // Split by any whitespace
                    .filter(n => n !== "")  // Remove empty strings
                    .join(" ");  // Join with single space
                const prize = $(cols[2]).text().trim();
                
                if (date && numbers && prize) {
                    results.push({
                        date,
                        numbers,
                        prize
                    });
                }
            }
        });

        return results;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}

async function updateLocalData() {
    try {
        // Read existing data
        let existingData = [];
        if (fs.existsSync(DATA_FILE)) {
            const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
            existingData = JSON.parse(fileContent);
        }

        // Get latest date from existing data
        const latestDate = existingData.length > 0 ? new Date(existingData[0].date.split(', ')[1]) : null;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if we need to update
        if (!latestDate || 
            latestDate.getDate() !== today.getDate() || 
            latestDate.getDate() !== yesterday.getDate()) {
            
            console.log('Fetching new data...');
            const newData = await fetchData();
            
            if (newData.length > 0) {
                // Merge new data with existing data
                const updatedData = [...newData, ...existingData];
                
                // Remove duplicates based on date
                const uniqueData = updatedData.filter((item, index, self) =>
                    index === self.findIndex((t) => t.date === item.date)
                );
                
                // Save to file
                fs.writeFileSync(DATA_FILE, JSON.stringify(uniqueData, null, 2));
                console.log('Data updated successfully');
            }
        } else {
            console.log('Data is up to date');
        }
    } catch (error) {
        console.error('Error updating data:', error.message);
    }
}

// Run the update
updateLocalData(); 
