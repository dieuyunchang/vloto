const { spawn } = require('child_process');
const path = require('path');

/**
 * Script to update data for both Vietlot 6/45 and Vietlot 6/55
 * This script runs the update-data.js files in both vietlot45 and vietlot55 directories
 * and generates template predictions
 */

console.log('🎲 Starting Vietlot Data Update Process...\n');

function runUpdateScript(directory, lotteryType) {
    return new Promise((resolve, reject) => {
        console.log(`📊 Updating ${lotteryType} data...`);
        
        const scriptPath = path.join(__dirname, directory, 'update-data.js');
        const updateProcess = spawn('node', [scriptPath], {
            cwd: path.join(__dirname, directory),
            stdio: 'inherit'
        });

        updateProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${lotteryType} data update completed successfully\n`);
                resolve();
            } else {
                console.log(`❌ ${lotteryType} data update failed with exit code ${code}\n`);
                reject(new Error(`${lotteryType} update failed`));
            }
        });

        updateProcess.on('error', (error) => {
            console.log(`❌ Error running ${lotteryType} update: ${error.message}\n`);
            reject(error);
        });
    });
}

async function updateAllData() {
    try {
        // Update Vietlot 6/45 data
        await runUpdateScript('vietlot45', 'Vietlot 6/45');
        
        // Update Vietlot 6/55 data
        await runUpdateScript('vietlot55', 'Vietlot 6/55');
        
        // Generate template predictions
        console.log('🔮 Generating template predictions...');
        const generateTemplatePredictions = require('./generate-template-predictions.js');
        await generateTemplatePredictions();
        
        console.log('🎉 All data updates completed successfully!');
        console.log('📁 Updated files:');
        console.log('   - vietlot45/json-data/vietlot45-data.json');
        console.log('   - vietlot45/json-data/*.json (summary files)');
        console.log('   - vietlot45/json-data/template-predictions.json');
        console.log('   - vietlot55/json-data/vietlot55-data.json');
        console.log('   - vietlot55/json-data/*.json (summary files)');
        console.log('   - vietlot55/json-data/template-predictions.json');
        
    } catch (error) {
        console.error('💥 Error during data update process:', error.message);
        process.exit(1);
    }
}

// Run the update process
updateAllData();