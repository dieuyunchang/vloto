# Vietlott Number Generator

A comprehensive web application for generating and analyzing lottery numbers for Vietlott Mega 6/55 and Mega 6/45 games using statistical analysis and AI predictions.

## Features

🎯 **AI-Powered Predictions** - Advanced forecasting using historical data trends  
📊 **Statistical Analysis** - Frequency analysis by day, month, and date patterns  
🔢 **Smart Number Generation** - Avoids duplicate combinations and common patterns  
📱 **Responsive Design** - Works on desktop and mobile devices  
⚡ **Real-time Updates** - No caching issues, always shows latest data  

## Quick Start

1. **Install Dependencies:**
```bash
npm install
```

2. **Start the Server:**
```bash
node server.js
```

3. **Access the Application:**
- **Main Page:** http://localhost:3005
- **Mega 6/55:** http://localhost:3005/vietlot55/vietlot55.html  
- **Mega 6/45:** http://localhost:3005/vietlot45/vietlot45.html

## Project Structure

```
vloto/
├── server.js                    # Main Express.js server with cache-busting
├── vietlot55/                   # Mega 6/55 lottery game
│   ├── json-data/              # Statistical data files
│   │   ├── vietlot55-data.json    # Historical drawing data
│   │   ├── predictions.json       # AI predictions
│   │   ├── day-of-week-summary.json
│   │   ├── month-summary.json
│   │   ├── day-of-month-summary.json
│   │   └── even-odd-summary.json
│   ├── vietlot55.html          # Main UI
│   ├── vietlot55.js            # Game logic
│   ├── update-data.js          # Data processing script
│   └── server.js               # Individual server (optional)
├── vietlot45/                   # Mega 6/45 lottery game  
│   ├── json-data/              # Statistical data files
│   │   ├── vietlot45-data.json    # Historical drawing data
│   │   ├── predictions.json       # AI predictions
│   │   ├── day-of-week-summary.json
│   │   ├── month-summary.json
│   │   ├── day-of-month-summary.json
│   │   └── even-odd-summary.json
│   ├── vietlot45.html          # Main UI
│   ├── vietlot45.js            # Game logic
│   ├── update-data.js          # Data processing script
│   └── server.js               # Individual server (optional)
├── mobile-app/                  # Mobile application
├── update-all-data.js          # Update all lottery data
├── lottery-prediction.js       # AI prediction engine
├── generate-template-predictions.js  # Template prediction generator
├── generate_vietlot55.rb       # Ruby data generator
└── generate_vietlot45.rb       # Ruby data generator
```

## Core Features

### 🔮 AI Predictions & Forecasting
- **FORECAST Analysis**: Trend-based predictions using historical patterns
- **Smart Algorithms**: Machine learning approaches for number selection
- **Confidence Scoring**: High/Medium/Low confidence indicators
- **Pattern Recognition**: Identifies hot and cold number cycles

### 🎯 Template Predictions
- **Pattern-based Analysis**: Analyzes number group patterns (G0-G5)
- **Comeback Intervals**: Tracks how often patterns repeat
- **Continuous Sequences**: Identifies consecutive pattern appearances
- **Frequency Analysis**: Statistical probability calculations
- **Confidence Levels**: Data quality and reliability scoring

### 📊 Statistical Analysis Dashboard
- **Day of Week Analysis**: Number frequency by weekday patterns
- **Monthly Trends**: Seasonal number occurrence patterns  
- **Date Analysis**: Even/odd date correlation with winning numbers
- **Frequency Heatmaps**: Visual representation of hot/cold numbers

### 🎯 Smart Number Generation
- **Duplicate Avoidance**: Never generates previously drawn combinations
- **Pattern Filtering**: Avoids common sequences and obvious patterns
- **Balanced Selection**: Optimal mix of odd/even and high/low numbers
- **Customizable Criteria**: User-selectable generation parameters

### 💻 Modern Web Interface
- **Responsive Design**: Works perfectly on mobile and desktop
- **Real-time Navigation**: Seamless switching between game types
- **Interactive Charts**: Click-to-explore statistical data
- **Clean URLs**: No cache parameters for better user experience

## Technical Architecture

### Server Configuration
- **Express.js Backend**: Robust web server with advanced caching prevention
- **Aggressive Cache-Busting**: Ensures users always see latest data
- **Static File Serving**: Optimized delivery of HTML, CSS, and JSON
- **Cross-Game Navigation**: Unified routing for both lottery types

### Data Processing Pipeline
```bash
# Update all lottery data
node update-all-data.js

# Update specific game data
node vietlot55/update-data.js
node vietlot45/update-data.js

# Generate predictions
node lottery-prediction.js
```

### Cache Management
The server implements aggressive cache prevention to ensure real-time updates:
- **HTTP Headers**: `no-cache, no-store, must-revalidate, proxy-revalidate`
- **Meta Tags**: HTML-level cache prevention directives
- **Dynamic ETags**: Unique identifiers for each request
- **Server-side Control**: Complete cache management at application level

## Game Rules

### Vietlott Mega 6/55
- **Numbers**: Select 6 from 1-55
- **Prize Structure**: Multiple prize tiers
- **Draw Schedule**: Regular weekly draws

### Vietlott Mega 6/45  
- **Numbers**: Select 6 from 1-45
- **Prize Structure**: Multiple prize tiers
- **Draw Schedule**: Regular weekly draws

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
node server.js

# Server runs at http://localhost:3005
```

### Data Updates
The application includes several data update mechanisms:
- `update-all-data.js`: Updates both games simultaneously and generates template predictions
- Individual update scripts in each game folder
- Ruby generators for bulk data processing
- Automated statistical summary generation
- Template prediction generation for pattern analysis

### File Structure
- **JSON Data**: Historical draws and statistical summaries
- **HTML/CSS/JS**: Frontend application files
- **Server Logic**: Express.js routing and cache management
- **Mobile App**: React Native mobile application (separate)

## Performance & Reliability

- ✅ **Zero Caching Issues**: Advanced cache-busting ensures fresh data
- ✅ **Fast Navigation**: Optimized routing between game types  
- ✅ **Mobile Optimized**: Responsive design for all devices
- ✅ **Real-time Updates**: Immediate reflection of data changes
- ✅ **Cross-browser Compatible**: Works in all modern browsers

## Support

For issues or questions about the Vietlott Number Generator, check the server logs or verify that all JSON data files are properly updated and accessible. 
