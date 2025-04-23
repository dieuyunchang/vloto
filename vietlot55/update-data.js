const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Create json-data directory if it doesn't exist
const jsonDataDir = path.join(__dirname, 'json-data');
if (!fs.existsSync(jsonDataDir)) {
    fs.mkdirSync(jsonDataDir);
}

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

// Function to calculate percentages
function calculatePercentages(counts, total) {
    return counts.map(count => ({
        number: count.number,
        percentage: Number(((count.count / total) * 100).toFixed(1))
    }));
}

// Function to process data and generate summaries
async function processData() {
    try {
        // Read existing data
        const dataPath = path.join(__dirname, 'vietlot55-data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

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
            dayOfWeekSummary[day] = calculatePercentages(dayOfWeekSummary[day], data.length);
            dayOfWeekSummary[day].sort((a, b) => a.number - b.number);
        });

        Object.keys(evenOddSummary).forEach(key => {
            evenOddSummary[key] = calculatePercentages(evenOddSummary[key], data.length);
            evenOddSummary[key].sort((a, b) => a.number - b.number);
        });

        Object.keys(monthSummary).forEach(month => {
            monthSummary[month] = calculatePercentages(monthSummary[month], data.length);
            monthSummary[month].sort((a, b) => a.number - b.number);
        });

        Object.keys(dayOfMonthSummary).forEach(day => {
            dayOfMonthSummary[day] = calculatePercentages(dayOfMonthSummary[day], data.length);
            dayOfMonthSummary[day].sort((a, b) => a.number - b.number);
        });

        // Write summary files
        fs.writeFileSync(
            path.join(jsonDataDir, 'day-of-week-summary.json'),
            JSON.stringify(dayOfWeekSummary, null, 2)
        );
        fs.writeFileSync(
            path.join(jsonDataDir, 'date-even-odd-summary.json'),
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

        // Move the original data file to json-data directory
        fs.renameSync(
            dataPath,
            path.join(jsonDataDir, 'vietlot55-data.json')
        );

        console.log('Summary files generated successfully!');
        console.log('Files created in:', jsonDataDir);
    } catch (error) {
        console.error('Error processing data:', error);
    }
}

// Run the processing
processData(); 
