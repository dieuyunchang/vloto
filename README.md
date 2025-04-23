# Vietlott Number Generator

A web application for generating and analyzing lottery numbers for Vietlott Mega 6/55 and Mega 6/45 games.

## Setup Instructions

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the server:
```bash
node server.js
```

3. Access the application:
- Main application: http://localhost:3005
- Mega 6/55: http://localhost:3005/vietlot55/vietlot55.html
- Mega 6/45: http://localhost:3005/vietlot45/vietlot45.html

## Project Structure

```
vietlot55/
├── json-data/                  # Directory containing JSON data files
│   ├── vietlot55-data.json    # Historical drawing data
│   ├── day-of-week-summary.json
│   ├── date-even-odd-summary.json
│   ├── month-summary.json
│   └── day-of-month-summary.json
├── vietlot55.html             # Main HTML file for Mega 6/55
├── vietlot55.js               # JavaScript logic for Mega 6/55
└── update-data.js             # Script to update and process data
```

## Features

### Data Analysis Functions

1. `getExistingGroups()`
   - Returns an array of previously drawn number groups
   - Used to avoid generating duplicate combinations

2. `has3Odd3Even(numbers)`
   - Checks if a group has exactly 3 odd and 3 even numbers
   - Returns true/false

3. `groupExists(numbers, existingGroups)`
   - Checks if a number combination already exists
   - Returns true/false

4. `calculateNumberFrequency()`
   - Calculates how often each number appears
   - Used for statistical analysis

5. `calculatePairFrequency()`
   - Analyzes frequency of number pairs
   - Used to avoid common combinations

6. `isCommonPair(num1, num2)`
   - Checks if two numbers commonly appear together
   - Returns true/false

### Number Generation

1. `generateGroup()`
   - Generates a single group of 6 unique numbers
   - Applies rules to avoid common patterns

2. `generateGroups()`
   - Generates multiple groups of numbers
   - Called when clicking the "Generate Numbers" button

### Display Functions

1. `showLastDraw()`
   - Displays the most recent lottery drawing
   - Shows date and winning numbers

2. `calculateSummary()`
   - Generates statistical summary of numbers
   - Shows frequency percentages

3. `initializePage()`
   - Initializes the page with data
   - Called when the page loads

## Data Processing

The `update-data.js` script processes lottery data and generates several summary files:

1. `day-of-week-summary.json`: Number frequency by day of the week
2. `date-even-odd-summary.json`: Number frequency on even/odd dates
3. `month-summary.json`: Number frequency by month
4. `day-of-month-summary.json`: Number frequency by day of month

## Styling

The application includes responsive styling with:
- Navigation bar for switching between games
- Color-coded frequency indicators
- Hover effects on number displays
- Mobile-friendly layout

## Notes

- The application uses historical data to generate statistically informed number combinations
- Numbers are generated following Vietlott rules (1-55 for Mega 6/55)
- The system avoids generating previously drawn combinations
- Statistical analysis is updated with each new drawing 
