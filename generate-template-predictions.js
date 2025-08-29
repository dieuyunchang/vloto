const fs = require('fs');
const path = require('path');
const TemplatePredictor45 = require('./vietlot45/template-prediction.js');
const TemplatePredictor55 = require('./vietlot55/template-prediction.js');

async function generateTemplatePredictions() {
    console.log('🔮 Generating Template Predictions for Both Games...\n');

    try {
        // Generate predictions for Vietlot45
        console.log('📊 Processing Vietlot45...');
        const vietlot45DataPath = path.join(__dirname, 'vietlot45', 'json-data', 'vietlot45-data.json');
        
        if (fs.existsSync(vietlot45DataPath)) {
            const vietlot45Data = JSON.parse(fs.readFileSync(vietlot45DataPath, 'utf8'));
            const predictor45 = new TemplatePredictor45(vietlot45Data);
            const report45 = predictor45.generatePredictionReport();
            
            // Save template predictions for vietlot45
            const outputPath45 = path.join(__dirname, 'vietlot45', 'json-data', 'template-predictions.json');
            fs.writeFileSync(outputPath45, JSON.stringify(report45, null, 2));
            
            console.log(`✅ Vietlot45 template predictions saved to: ${outputPath45}`);
            console.log(`📈 Total templates analyzed: ${report45.total_templates_analyzed}`);
            console.log(`🎯 High probability templates: ${report45.prediction_summary.high_probability}`);
            console.log(`📊 Medium probability templates: ${report45.prediction_summary.medium_probability}`);
            console.log(`📉 Low probability templates: ${report45.prediction_summary.low_probability}\n`);
        } else {
            console.log('❌ Vietlot45 data file not found. Skipping...\n');
        }

        // Generate predictions for Vietlot55
        console.log('📊 Processing Vietlot55...');
        const vietlot55DataPath = path.join(__dirname, 'vietlot55', 'json-data', 'vietlot55-data.json');
        
        if (fs.existsSync(vietlot55DataPath)) {
            const vietlot55Data = JSON.parse(fs.readFileSync(vietlot55DataPath, 'utf8'));
            const predictor55 = new TemplatePredictor55(vietlot55Data);
            const report55 = predictor55.generatePredictionReport();
            
            // Save template predictions for vietlot55
            const outputPath55 = path.join(__dirname, 'vietlot55', 'json-data', 'template-predictions.json');
            fs.writeFileSync(outputPath55, JSON.stringify(report55, null, 2));
            
            console.log(`✅ Vietlot55 template predictions saved to: ${outputPath55}`);
            console.log(`📈 Total templates analyzed: ${report55.total_templates_analyzed}`);
            console.log(`🎯 High probability templates: ${report55.prediction_summary.high_probability}`);
            console.log(`📊 Medium probability templates: ${report55.prediction_summary.medium_probability}`);
            console.log(`📉 Low probability templates: ${report55.prediction_summary.low_probability}\n`);
        } else {
            console.log('❌ Vietlot55 data file not found. Skipping...\n');
        }

        console.log('🎉 Template prediction generation completed successfully!');
        console.log('\n📁 Generated files:');
        console.log('   - vietlot45/json-data/template-predictions.json');
        console.log('   - vietlot55/json-data/template-predictions.json');
        
    } catch (error) {
        console.error('❌ Error generating template predictions:', error.message);
        process.exit(1);
    }
}

// Run the script if called directly
if (require.main === module) {
    generateTemplatePredictions();
}

module.exports = generateTemplatePredictions;
