const PredictionDashboard = require('./prediction-dashboard.js');

console.log('🎯 Generating Lottery Prediction Dashboard...\n');

try {
    const dashboard = new PredictionDashboard();
    const result = dashboard.saveDashboard();
    
    console.log('\n🎉 Dashboard generation completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Vietlot 6/45 Templates: ${result.report.vietlot45?.template_analysis.total_templates || 0}`);
    console.log(`   - Vietlot 6/55 Templates: ${result.report.vietlot55?.template_analysis.total_templates || 0}`);
    console.log(`   - Recommendations: ${result.report.recommendations.length}`);
    
    console.log('\n🔗 Open prediction-dashboard.html in your browser to view the visual dashboard');
    console.log('📄 Check prediction-report.json for detailed analysis data');
    
} catch (error) {
    console.error('❌ Error generating dashboard:', error.message);
    process.exit(1);
}
