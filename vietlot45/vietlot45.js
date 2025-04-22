const totalNumber = 45;

// Process existing groups from the JSON data
function getExistingGroups() {
    if (!window.lotteryData) {
        console.error('Lottery data not loaded yet');
        return [];
    }
    return window.lotteryData.map(item => item.numbers);
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
    if (!window.lotteryData) {
        console.error('Lottery data not loaded yet');
        return Array(totalNumber).fill(0);
    }
    const frequency = Array(totalNumber).fill(0);
    window.lotteryData.forEach(draw => {
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
    if (!window.lotteryData) {
        console.error('Lottery data not loaded yet');
        return {};
    }
    const pairs = {};
    window.lotteryData.forEach(draw => {
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
    if (!window.lotteryData) {
        console.error('Lottery data not loaded yet');
        document.getElementById("results").innerHTML = "Please wait for data to load...";
        return;
    }
    
    console.log('Generating groups...');
    let newGroups = [];
    for (let i = 0; i < 5; i++) {
        newGroups.push(generateGroup());
    }
    
    document.getElementById("results").innerHTML = newGroups
        .map((group, index) => `<p>Numbers ${index + 1}: <span class='number-group'>${group}</span></p>`)
        .join("");
}

function showLastDraw() {
    if (!window.lotteryData || !window.lotteryData.length) {
        console.error('Lottery data not loaded yet');
        return;
    }
    
    const lastDraw = window.lotteryData[0];
    const list_numbers = lastDraw.numbers
        .split(/\s+/)  // Split by any whitespace
        .map(n => n.trim())  // Remove whitespace
        .filter(n => n !== "");  // Remove empty strings
    const numbers = list_numbers.map(n => `<span>${n}</span>`).join("");
    const lastDrawHTML = `
        <div class="last-draw">
            <h2>Last Draw (${lastDraw.date})</h2>
            <p>Numbers: <span class='number-group'>${numbers}</span></p>
            <p>Prize: ${lastDraw.prize}</p>
        </div>
    `;
    document.getElementById("last-draw").innerHTML = lastDrawHTML;
}

function calculateSummary() {
    if (!window.lotteryData || !window.lotteryData.length) {
        console.error('Lottery data not loaded yet');
        document.getElementById("summary").innerHTML = "Loading data...";
        return;
    }
    
    console.log('Calculating summary for', window.lotteryData.length, 'records');
    let countMap = Array(totalNumber).fill(0);
    
    window.lotteryData.forEach(draw => {
        if (draw.numbers) {
            draw.numbers.split(" ").forEach(num => {
                countMap[parseInt(num) - 1]++;
            });
        }
    });
    
    // Calculate percentages and find min/max for scaling
    const percentages = countMap.map(count => (count / window.lotteryData.length) * 100);
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
    calculateSummary();
    showLastDraw();
}

// Make functions available globally
window.generateGroups = generateGroups;
window.initializePage = initializePage; 
