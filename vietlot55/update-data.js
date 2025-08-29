const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const LotteryPredictor = require('../lottery-prediction.js');
const { updateTemplatesWithNewData } = require('../template-updater.js');

// Create json-data directory if it doesn't exist
const jsonDataDir = path.join(__dirname, 'json-data');
if (!fs.existsSync(jsonDataDir)) {
    fs.mkdirSync(jsonDataDir);
}

const DATA_FILE = path.join(jsonDataDir, 'vietlot55-data.json');
const BASE_URL = 'https://www.ketquadientoan.com/tat-ca-ky-xo-so-power-655.html';

// Function to parse date string to Date object
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
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

// Function to split jackpot numbers (latest requirement.txt)
function splitJackpotNumbers(numbersString) {
    const numbers = numbersString.split(' ');
    
    if (numbers.length === 7) {
        const jackpot1 = numbers.slice(0, 6).join(' ');  // First 6 numbers
        const jackpot2 = numbers[6];                      // Last number
        return { jackpot1, jackpot2 };
    }
    
    // If not 7 numbers, return as is
    return { jackpot1: numbersString, jackpot2: '' };
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

    // Initialize counts for all numbers (1-55)
    for (let i = 1; i <= 55; i++) {
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
        const date = parseDate(draw.date.split(', ')[1]);
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
            dayOfWeekSummary[dayNames[dayOfWeek]][dayIndex].count++;

            // Update even/odd counts
            const evenOddKey = isEven ? "even" : "odd";
            const evenOddIndex = evenOddSummary[evenOddKey].findIndex(item => item.number === number);
            evenOddSummary[evenOddKey][evenOddIndex].count++;

            // Update month counts
            const monthIndex = monthSummary[month].findIndex(item => item.number === number);
            monthSummary[month][monthIndex].count++;

            // Update day of month counts
            const dayOfMonthIndex = dayOfMonthSummary[dayOfMonth].findIndex(item => item.number === number);
            dayOfMonthSummary[dayOfMonth][dayOfMonthIndex].count++;
        });
    });

    // Calculate percentages and sort by number
    Object.keys(dayOfWeekSummary).forEach(day => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date.split(', ')[1]);
            return getDayOfWeek(date) === ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(day);
        }).length;
        dayOfWeekSummary[day] = calculatePercentages(dayOfWeekSummary[day], totalDraws);
        dayOfWeekSummary[day].sort((a, b) => a.number - b.number);
    });

    Object.keys(evenOddSummary).forEach(key => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date.split(', ')[1]);
            return (key === "even" ? isEvenDate(date) : !isEvenDate(date));
        }).length;
        evenOddSummary[key] = calculatePercentages(evenOddSummary[key], totalDraws);
        evenOddSummary[key].sort((a, b) => a.number - b.number);
    });

    Object.keys(monthSummary).forEach(month => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date.split(', ')[1]);
            return getMonth(date) === Number(month);
        }).length;
        monthSummary[month] = calculatePercentages(monthSummary[month], totalDraws);
        monthSummary[month].sort((a, b) => a.number - b.number);
    });

    Object.keys(dayOfMonthSummary).forEach(day => {
        const totalDraws = data.filter(draw => {
            const date = parseDate(draw.date.split(', ')[1]);
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

    // Generate predictions using Excel-like FORECAST & TREND methods
    console.log('🔮 Generating predictions using FORECAST & TREND analysis...');
    const predictor = new LotteryPredictor(data, 55); // 55 numbers for vietlot55
    const predictionReport = predictor.getPredictionReport();
    
    fs.writeFileSync(
        path.join(jsonDataDir, 'predictions.json'),
        JSON.stringify(predictionReport, null, 2)
    );
    console.log('Generated predictions.json with FORECAST & TREND analysis');

    console.log('Summary files generated successfully!');
}

// Function to calculate template tracking fields
function calculateTemplateTrackingFields(dataWithTemplateIds) {
    console.log('🔍 Calculating template tracking fields...');
    
    // Create a map to track template history
    const templateHistory = new Map(); // template_id -> { lastAppearance: date, continuousCount: number, totalCount: number }
    
    // Process data in chronological order (oldest first)
    const sortedData = [...dataWithTemplateIds].reverse();
    
    return sortedData.map((entry, index) => {
        const templateId = entry.template_id;
        
        if (!templateId) {
            return {
                ...entry,
                template_appear_comback_from_prev_count: 0,
                template_continuos_count: 1,
                template_appear_count: 1
            };
        }
        
        const currentDate = parseDate(entry.date.split(', ')[1]);
        const history = templateHistory.get(templateId);
        
        let template_appear_comback_from_prev_count = 0;
        let template_continuos_count = 1;
        let template_appear_count = 1;
        
        if (history) {
            // Calculate days between current and last appearance
            const daysDiff = Math.floor((currentDate - history.lastAppearance) / (1000 * 60 * 60 * 24));
            template_appear_comback_from_prev_count = daysDiff;
            
            // Check if this is continuous (same template as previous entry)
            if (index > 0 && sortedData[index - 1].template_id === templateId) {
                template_continuos_count = history.continuousCount + 1;
            } else {
                template_continuos_count = 1;
            }
            
            template_appear_count = history.totalCount + 1;
        }
        
        // Update history
        templateHistory.set(templateId, {
            lastAppearance: currentDate,
            continuousCount: template_continuos_count,
            totalCount: template_appear_count
        });
        
        return {
            ...entry,
            template_appear_comback_from_prev_count,
            template_continuos_count,
            template_appear_count
        };
    }).reverse(); // Reverse back to original order (newest first)
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
                    // Split numbers into jackpot1 and jackpot2 (latest requirement.txt)
                    const { jackpot1, jackpot2 } = splitJackpotNumbers(numbers);
                    
                    // Calculate based on jackpot1 (first 6 numbers only)
                    const total = calculateTotal(jackpot1);
                    const totalEvenOrOdd = getTotalEvenOrOdd(total);
                    const numericPrize = extractNumericPrize(prize);
                    const oddCount = countOddNumbers(jackpot1);
                    const evenCount = countEvenNumbers(jackpot1);
                    
                    results.push({
                        date,
                        jackpot1: jackpot1,    // New: first 6 numbers
                        jackpot2: jackpot2,    // New: last number  
                        numbers,               // Keep original for compatibility
                        prize_s: prize,        // Renamed from prize to prize_s
                        prize: numericPrize,   // New numeric prize field
                        total: total,          // Based on jackpot1 only
                        total_even_or_odd: totalEvenOrOdd,
                        odd_count: oddCount,   // Based on jackpot1 only
                        even_count: evenCount  // Based on jackpot1 only
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
                
                // Update templates with new patterns and get data with template IDs
                const dataWithTemplateIds = updateTemplatesWithNewData(uniqueData, 'vietlot55');

                // Calculate template tracking fields
                const dataWithTrackingFields = calculateTemplateTrackingFields(dataWithTemplateIds);

                // Save to file with template IDs and tracking fields
                fs.writeFileSync(DATA_FILE, JSON.stringify(dataWithTrackingFields, null, 2));
                console.log('Data updated successfully with template tracking fields');

                // Generate summary files
                generateSummaries(dataWithTrackingFields);
            }
        } else {
            console.log('Data is up to date');
            // Generate summary files with existing data
            generateSummaries(existingData);
        }
    } catch (error) {
        console.error('Error updating data:', error.message);
    }
}

// Run the update
updateLocalData(); 
