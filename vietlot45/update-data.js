const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const totalNumber = 45;
// Create json-data directory if it doesn't exist
const jsonDataDir = path.join(__dirname, 'json-data');
if (!fs.existsSync(jsonDataDir)) {
    fs.mkdirSync(jsonDataDir);
}

const DATA_FILE = path.join(jsonDataDir, 'vietlot45-data.json');
const BASE_URL = 'https://www.ketquadientoan.com/tat-ca-ky-xo-so-mega-6-45.html';

// Function to parse date string to Date object
function parseDate(dateStr) {
    // Handle format like "T4, 02/07/2025" or just "02/07/2025"
    let datePart = dateStr;
    if (dateStr.includes(', ')) {
        datePart = dateStr.split(', ')[1];
    }
    
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Function to get day of week (0-6, where 0 is Sunday)
function getDayOfWeek(date) {
    return date.getDay();
}

// Function to check if date is even
function isEvenDate(date) {
    return date.getDate() % 2 === 0;
}

// Function to get month (1-12)
function getMonth(date) {
    return date.getMonth() + 1;
}

// Function to get day of month (1-31)
function getDayOfMonth(date) {
    return date.getDate();
}

// Function to calculate total of numbers (requirement.txt)
function calculateTotal(numbersString) {
    const numbers = numbersString.split(' ').map(num => parseInt(num.trim()));
    return numbers.reduce((sum, num) => sum + num, 0);
}

// Function to determine if total is even or odd (requirement.txt)
function getTotalEvenOrOdd(total) {
    return total % 2 === 0 ? 'even' : 'odd';
}

// Function to extract numeric prize from prize string (updated requirement.txt)
function extractNumericPrize(prizeString) {
    const match = prizeString.match(/^([0-9.]+)/);
    if (match) {
        return match[1].replace(/\./g, '');
    }
    return "0";
}

// Function to count odd numbers (updated requirement.txt)
function countOddNumbers(numbersString) {
    const numbers = numbersString.split(' ').map(num => parseInt(num.trim()));
    return numbers.filter(num => num % 2 === 1).length;
}

// Function to count even numbers (updated requirement.txt) 
function countEvenNumbers(numbersString) {
    const numbers = numbersString.split(' ').map(num => parseInt(num.trim()));
    return numbers.filter(num => num % 2 === 0).length;
}

// Function to calculate percentages
function calculatePercentages(counts, total) {
    return counts.map(count => ({
        number: count.number,
        count: count.count,
        percentage: Number(((count.count / total) * 100).toFixed(1))
    }));
}

// Function to generate summary files
function generateSummaries(data) {
    // Initialize summary objects
    const dayOfWeekSummary = {
        "sun": [], "mon": [], "tue": [], "wed": [], "thu": [], "fri": [], "sat": []
    };
    const evenOddSummary = {
        "even": [], "odd": []
    };
    const monthSummary = {};
    const dayOfMonthSummary = {};

    // Initialize counts for all numbers (1-45)
    for (let i = 1; i <= totalNumber; i++) {
        // Initialize day of week counts
        Object.keys(dayOfWeekSummary).forEach(day => {
            dayOfWeekSummary[day].push({ number: i, count: 0 });
        });

        // Initialize even/odd counts
        evenOddSummary.even.push({ number: i, count: 0 });
        evenOddSummary.odd.push({ number: i, count: 0 });

        // Initialize month counts
        for (let month = 1; month <= 12; month++) {
            if (!monthSummary[month]) {
                monthSummary[month] = [];
            }
            monthSummary[month].push({ number: i, count: 0 });
        }

        // Initialize day of month counts
        for (let day = 1; day <= 31; day++) {
            if (!dayOfMonthSummary[day]) {
                dayOfMonthSummary[day] = [];
            }
            dayOfMonthSummary[day].push({ number: i, count: 0 });
        }
    }

    // Process each draw
    data.forEach(draw => {
        const date = parseDate(draw.date);
        const numbers = draw.numbers.split(' ').map(Number);
        const dayOfWeek = getDayOfWeek(date);
        const isEven = isEvenDate(date);
        const month = getMonth(date);
        const dayOfMonth = getDayOfMonth(date);

        // Update counts for each number
        numbers.forEach(number => {
            // Update day of week counts
            const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
            const dayIndex = dayOfWeekSummary[dayNames[dayOfWeek]].findIndex(item => item.number === number);
            if (dayIndex >= 0) {
                dayOfWeekSummary[dayNames[dayOfWeek]][dayIndex].count++;
            }

            // Update even/odd counts
            const evenOddKey = isEven ? "even" : "odd";
            const evenOddIndex = evenOddSummary[evenOddKey].findIndex(item => item.number === number);
            if (evenOddIndex >= 0) {
                evenOddSummary[evenOddKey][evenOddIndex].count++;
            }

            // Update month counts
            if (monthSummary[month]) {
                const monthIndex = monthSummary[month].findIndex(item => item.number === number);
                if (monthIndex >= 0) {
                    monthSummary[month][monthIndex].count++;
                }
            }

            // Update day of month counts
            if (dayOfMonthSummary[dayOfMonth]) {
                const dayOfMonthIndex = dayOfMonthSummary[dayOfMonth].findIndex(item => item.number === number);
                if (dayOfMonthIndex >= 0) {
                    dayOfMonthSummary[dayOfMonth][dayOfMonthIndex].count++;
                }
            }
        });
    });

    // Calculate percentages and sort by number
    Object.keys(dayOfWeekSummary).forEach(day => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date);
            return getDayOfWeek(date) === ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(day);
        }).length;
        dayOfWeekSummary[day] = calculatePercentages(dayOfWeekSummary[day], totalDraws);
        dayOfWeekSummary[day].sort((a, b) => a.number - b.number);
    });

    Object.keys(evenOddSummary).forEach(key => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date);
            return (key === "even" ? isEvenDate(date) : !isEvenDate(date));
        }).length;
        evenOddSummary[key] = calculatePercentages(evenOddSummary[key], totalDraws);
        evenOddSummary[key].sort((a, b) => a.number - b.number);
    });

    Object.keys(monthSummary).forEach(month => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date);
            return getMonth(date) === Number(month);
        }).length;
        monthSummary[month] = calculatePercentages(monthSummary[month], totalDraws);
        monthSummary[month].sort((a, b) => a.number - b.number);
    });

    Object.keys(dayOfMonthSummary).forEach(day => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date);
            return getDayOfMonth(date) === Number(day);
        }).length;
        dayOfMonthSummary[day] = calculatePercentages(dayOfMonthSummary[day], totalDraws);
        dayOfMonthSummary[day].sort((a, b) => a.number - b.number);
    });

    // Write summary files
    fs.writeFileSync(
        path.join(jsonDataDir, 'day-of-week-summary.json'),
        JSON.stringify(dayOfWeekSummary, null, 2)
    );
    fs.writeFileSync(
        path.join(jsonDataDir, 'even-odd-summary.json'),
        JSON.stringify(evenOddSummary, null, 2)
    );
    fs.writeFileSync(
        path.join(jsonDataDir, 'month-summary.json'),
        JSON.stringify(monthSummary, null, 2)
    );
    fs.writeFileSync(
        path.join(jsonDataDir, 'day-of-month-summary.json'),
        JSON.stringify(dayOfMonthSummary, null, 2)
    );

    console.log('Summary files generated successfully!');
}

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

        const startDate = '01-01-2016'; // Fixed start date
        const endDate = formatDate(today);
        
        const url = `${BASE_URL}?datef=${startDate}&datet=${endDate}`;
        console.log('Fetching data from:', url);
        
        const response = await axios.get(url);
        // console.log(response.data)
        const $ = cheerio.load(response.data);
        
        const results = [];
        $('table.table-mini-result tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 3) {  // Changed from 4 to 3
                const date = $(cols[0]).text().trim();
                const numbersText = $(cols[1]).text().trim();
                const prize = $(cols[2]).text().trim();
                
                // Parse numbers using regex to extract 1-2 digit numbers
                const numbers = numbersText.match(/\b\d{1,2}\b/g);
                
                if (date && numbers && numbers.length === 6 && prize) {
                    const numbersStr = numbers.join(" ");
                    const total = calculateTotal(numbersStr);
                    const totalEvenOrOdd = getTotalEvenOrOdd(total);
                    const numericPrize = extractNumericPrize(prize);
                    const oddCount = countOddNumbers(numbersStr);
                    const evenCount = countEvenNumbers(numbersStr);
                    
                    results.push({
                        date,
                        numbers: numbersStr,
                        prize_s: prize,         // Renamed from prize to prize_s
                        prize: numericPrize,    // New numeric prize field
                        total: total,
                        total_even_or_odd: totalEvenOrOdd,
                        odd_count: oddCount,    // New odd count field
                        even_count: evenCount   // New even count field
                    });
                }
            }
        });
        console.log("vlot 45 results", results)
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
        const latestDate = existingData.length > 0 ? parseDate(existingData[0].date) : null;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if we need to update (always update for now to ensure we have the latest data)
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

            // Generate summary files
            generateSummaries(uniqueData);
        } else {
            console.log('No new data found');
            if (existingData.length > 0) {
                // Generate summary files with existing data
                generateSummaries(existingData);
            }
        }
    } catch (error) {
        console.error('Error updating data:', error.message);
    }
}

// Run the update
updateLocalData(); 
