// Embedded lottery data
const data = [
  {
    "date": "T7, 15/03/2025",
    "jackpot1": "01 34 39 40 42 50",
    "jackpot2": "07",
    "numbers": "01 34 39 40 42 50 07",
    "prize_s": "133.643.776.800≈ 133.6 Tỷ",
    "prize": "133643776800",
    "total": 252,
    "total_even_or_odd": "even",
    "odd_count": 3,
    "even_count": 3
  },
  {
    "date": "T5, 13/03/2025",
    "jackpot1": "07 13 21 43 52 53",
    "jackpot2": "12",
    "numbers": "07 13 21 43 52 53 12",
    "prize_s": "123.635.113.500≈ 123.6 Tỷ",
    "prize": "123635113500",
    "total": 189,
    "total_even_or_odd": "odd",
    "odd_count": 4,
    "even_count": 2
  },
  {
    "date": "T3, 11/03/2025",
    "jackpot1": "01 16 18 30 31 44",
    "jackpot2": "25",
    "numbers": "01 16 18 30 31 44 25",
    "prize_s": "115.151.239.200≈ 115.2 Tỷ",
    "prize": "115151239200",
    "total": 140,
    "total_even_or_odd": "even",
    "odd_count": 2,
    "even_count": 4
  },
  {
    "date": "T7, 08/03/2025",
    "jackpot1": "10 38 41 43 45 48",
    "jackpot2": "33",
    "numbers": "10 38 41 43 45 48 33",
    "prize_s": "107.773.238.100≈ 107.8 Tỷ",
    "prize": "107773238100",
    "total": 225,
    "total_even_or_odd": "odd",
    "odd_count": 3,
    "even_count": 3
  },
  {
    "date": "T5, 06/03/2025",
    "jackpot1": "05 10 21 26 43 51",
    "jackpot2": "17",
    "numbers": "05 10 21 26 43 51 17",
    "prize_s": "101.684.818.650≈ 101.7 Tỷ",
    "prize": "101684818650",
    "total": 156,
    "total_even_or_odd": "even",
    "odd_count": 3,
    "even_count": 3
  }
];

const totalNumber = 55;

// Process existing groups from the JSON data
function getExistingGroups() {
    if (!window.lotteryData || !window.lotteryData.draws) return [];
    return window.lotteryData.draws.map(item => item.numbers);
}

function has3Odd3Even(numbers) {
    let evenCount = numbers.filter(n => n % 2 === 0).length;
    return evenCount === 3;
}

function groupExists(group) {
    const existingGroups = getExistingGroups();
    return existingGroups.includes(group);
}

// Calculate number frequency
function calculateNumberFrequency() {
    if (!window.lotteryData || !window.lotteryData.draws) return Array(totalNumber).fill(0);
    
    const frequency = Array(totalNumber).fill(0);
    window.lotteryData.draws.forEach(draw => {
        if (draw.numbers) {
            draw.numbers.split(" ").forEach(num => {
                frequency[parseInt(num) - 1]++;
            });
        }
    });
    return frequency;
}

// Calculate number pairs frequency
function calculatePairFrequency() {
    if (!window.lotteryData || !window.lotteryData.draws) return {};
    
    const pairs = {};
    window.lotteryData.draws.forEach(draw => {
        if (draw.numbers) {
            const numbers = draw.numbers.split(" ").map(n => parseInt(n));
            for (let i = 0; i < numbers.length; i++) {
                for (let j = i + 1; j < numbers.length; j++) {
                    const pair = [numbers[i], numbers[j]].sort((a, b) => a - b).join("-");
                    pairs[pair] = (pairs[pair] || 0) + 1;
                }
            }
        }
    });
    return pairs;
}

// Check if a pair is common (appears in top 20% of pairs)
function isCommonPair(numbers, pairFrequency) {
    const pairs = [];
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            pairs.push([numbers[i], numbers[j]].sort((a, b) => a - b).join("-"));
        }
    }
    
    const sortedPairs = Object.entries(pairFrequency).sort((a, b) => b[1] - a[1]);
    const topPairs = sortedPairs.slice(0, Math.floor(sortedPairs.length * 0.2)).map(p => p[0]);
    
    return pairs.some(pair => topPairs.includes(pair));
}

function generateGroup() {
    const frequency = calculateNumberFrequency();
    const pairFrequency = calculatePairFrequency();
    
    while (true) {
        // Generate numbers with weighted probability based on frequency
        let numbers = Array.from({ length: totalNumber }, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5)
            .slice(0, 6)
            .sort((a, b) => a - b);
        
        let group = numbers.map(n => String(n).padStart(2, '0')).join(" ");
        
        // Check conditions
        if (!has3Odd3Even(numbers) && 
            !groupExists(group) && 
            !isCommonPair(numbers, pairFrequency)) {
            return numbers.map(n => `<span>${String(n).padStart(2, '0')}</span>`).join("");
        }
    }
}

function generateGroups() {
  console.log('Generating groups...');
  let newGroups = [];
  for (let i = 0; i < 5; i++) {
      newGroups.push(generateGroup());
  }
  
  document.getElementById("results").innerHTML = newGroups
      .map((group, index) => `<p>Numbers ${index + 1}: <span class='number-group'>${group}</span></p>`)
      .join("");
  console.log('Done Generating groups');
}

function showLastDraw() {
    if (!window.lotteryData || !window.lotteryData.draws || window.lotteryData.draws.length === 0) {
        return;
    }
    
    const lastDraw = window.lotteryData.draws[0];
    const list_numbers = lastDraw.numbers
        .split(/\s+/)  // Split by any whitespace (spaces, tabs, newlines)
        .map(n => n.trim())  // Remove whitespace
        .filter(n => n !== "")  // Remove empty strings
        .map(n => parseInt(n));  // Convert to integers
    
    // Function to get group for a number (Vietlot55: 1-55)
    function getNumberGroup(num) {
        if (num >= 1 && num <= 9) return 'G0';
        if (num >= 10 && num <= 19) return 'G1';
        if (num >= 20 && num <= 29) return 'G2';
        if (num >= 30 && num <= 39) return 'G3';
        if (num >= 40 && num <= 49) return 'G4';
        if (num >= 50 && num <= 55) return 'G5';
        return 'G0'; // fallback
    }
    
    // Create numbers with group colors (exclude the last number which is not part of Vietlot55)
    const numbers = list_numbers.map((n, index) => {
        // // Don't color the last number (index 5) as it's not part of Vietlot55
        if (index === 6) {
            return `<span class="last-draw-number jackpot2">${String(n).padStart(2, '0')}</span>`;
        }
        const groupClass = getNumberGroup(n).toLowerCase();
        return `<span class="last-draw-number group-${groupClass}">${String(n).padStart(2, '0')}</span>`;
    }).join("");
    
    const templateId = lastDraw.template_id || 'N/A';
    const lastDrawHTML = `
        <div class="last-draw">
            <h2>Last Draw (${lastDraw.date})</h2>
            <p>Numbers: <span class='number-group'>${numbers}</span></p>
            <p>Prize: ${lastDraw.prize_s}</p>
            <p>Template ID: <strong>${templateId}</strong></p>
        </div>
    `;
    document.getElementById("last-draw").innerHTML = lastDrawHTML;
}

function calculateSummary() {
    if (!window.lotteryData || !window.lotteryData.draws) {
        console.error('Lottery data not loaded yet');
        document.getElementById("summary").innerHTML = "Loading data...";
        return;
    }
    
    console.log('Calculating summary for', window.lotteryData.draws.length, 'records');
    let countMap = Array(totalNumber).fill(0);
    
    window.lotteryData.draws.forEach(draw => {
        if (draw.numbers) {
            draw.numbers.split(" ").forEach(num => {
                countMap[parseInt(num) - 1]++;
            });
        }
    });
    
    // Calculate percentages and find min/max for scaling
    const percentages = countMap.map(count => (count / window.lotteryData.draws.length) * 100);
    const minPercent = Math.min(...percentages);
    const maxPercent = Math.max(...percentages);
    const range = maxPercent - minPercent;
    
    // Define percentage ranges for colors
    const getFrequencyClass = (percent) => {
        const normalized = (percent - minPercent) / range;
        if (normalized < 0.2) return 'frequency-low';
        if (normalized < 0.4) return 'frequency-medium-low';
        if (normalized < 0.6) return 'frequency-medium';
        if (normalized < 0.8) return 'frequency-medium-high';
        return 'frequency-high';
    };

    let tableHTML = "<h2>Number Frequency Summary</h2><div class='container'>"
    for (let i = 1; i <= totalNumber; i++) {
        const percent = percentages[i-1];
        const frequencyClass = getFrequencyClass(percent);
        tableHTML += `<div class='item ${frequencyClass}'>`;
        tableHTML += `<div class='number'><strong>${String(i).padStart(2, '0')}</strong></div>`;
        tableHTML += `<div class='percentage'>${percent.toFixed(1)}%</div>`;
        tableHTML += "</div>";
    }
    tableHTML += "</div>"
    document.getElementById("summary").innerHTML = tableHTML;
}

// Initialize the page when data is loaded
function initializePage() {
    console.log('Initializing page...');
    if (!window.lotteryData || !window.lotteryData.draws) {
        console.error('Lottery data not loaded yet');
        document.getElementById("summary").innerHTML = "Loading data...";
        return;
    }
    calculateSummary();
    showLastDraw();
}

// Make functions available globally
window.generateGroups = generateGroups;
window.initializePage = initializePage;
