// Shared template updater module
// Updates templates.json when new lottery data is added

const fs = require('fs');
const path = require('path');

// Function to convert a number to its group (G0-G9)
function numberToGroup(num) {
    const tens = Math.floor(num / 10);
    return `G${tens}`;
}

// Function to convert numbers string to group pattern
function numbersToPattern(numbersStr) {
    const numbers = numbersStr.split(' ').map(n => parseInt(n.trim()));
    const groups = numbers.map(numberToGroup);
    groups.sort(); // Sort to ensure consistent pattern representation
    return groups;
}

// Function to convert pattern array to string for comparison
function patternToString(pattern) {
    return JSON.stringify(pattern);
}

// Function to read existing templates
function readExistingTemplates() {
    const templatesPath = path.join(__dirname, 'templates-config', 'templates.json');
    try {
        const data = fs.readFileSync(templatesPath, 'utf8');
        const templatesData = JSON.parse(data);
        return templatesData.templates || [];
    } catch (error) {
        console.log('No existing templates file found');
        return [];
    }
}

// Function to write templates in inline format
function writeTemplatesInline(templates) {
    const templatesPath = path.join(__dirname, 'templates-config', 'templates.json');
    
    let output = '{\n  "templates": [\n';
    
    templates.forEach((template, index) => {
        const groupStr = JSON.stringify(template.group);
        const comma = index < templates.length - 1 ? ',' : '';
        output += `    { "id": "${template.id}", "group": ${groupStr} }${comma}\n`;
    });
    
    output += '  ]\n}';
    
    fs.writeFileSync(templatesPath, output);
}

// Main function to update templates with new data
function updateTemplatesWithNewData(newLotteryData, dataSource = 'unknown') {
    console.log(`\n🔄 Updating templates with new ${dataSource} data...`);
    
    try {
        // Read existing templates
        const existingTemplates = readExistingTemplates();
        const existingPatterns = new Set();
        
        existingTemplates.forEach(template => {
            const sortedGroup = [...template.group].sort();
            existingPatterns.add(patternToString(sortedGroup));
        });
        
        // Extract patterns from new data
        const newPatterns = new Set();
        let processedCount = 0;
        
        newLotteryData.forEach(entry => {
            let numbersStr = null;
            
            // Handle different data sources
            if (dataSource === 'vietlot45' && entry.numbers) {
                numbersStr = entry.numbers;
            } else if (dataSource === 'vietlot55' && entry.jackpot1) {
                numbersStr = entry.jackpot1;
            }
            
            if (numbersStr) {
                const pattern = numbersToPattern(numbersStr);
                const patternStr = patternToString(pattern);
                
                if (!existingPatterns.has(patternStr)) {
                    newPatterns.add(patternStr);
                }
                processedCount++;
            }
        });
        
        console.log(`📊 Processed ${processedCount} entries from ${dataSource}`);
        
        if (newPatterns.size > 0) {
            // Create new template entries
            let currentId = existingTemplates.length + 1;
            const newTemplates = Array.from(newPatterns).map(patternStr => ({
                id: `T${currentId++}`,
                group: JSON.parse(patternStr)
            }));
            
            // Combine existing and new templates
            const allTemplates = [...existingTemplates, ...newTemplates];
            
            // Write updated templates file in inline format
            writeTemplatesInline(allTemplates);
            
            console.log(`✅ Added ${newTemplates.length} new templates`);
            console.log(`📝 Total templates: ${allTemplates.length}`);
            
            // Show examples of new patterns
            if (newTemplates.length > 0) {
                console.log(`🔍 New patterns added:`);
                newTemplates.slice(0, 3).forEach(template => {
                    console.log(`   ${template.id}: ${JSON.stringify(template.group)}`);
                });
                if (newTemplates.length > 3) {
                    console.log(`   ... and ${newTemplates.length - 3} more`);
                }
            }
        } else {
            console.log(`ℹ️  No new templates needed for ${dataSource}`);
        }
        
    } catch (error) {
        console.error(`❌ Error updating templates:`, error.message);
    }
}

module.exports = {
    updateTemplatesWithNewData,
    numbersToPattern,
    numberToGroup
};