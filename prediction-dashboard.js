const fs = require('fs');
const path = require('path');

class PredictionDashboard {
    constructor() {
        this.vietlot45Data = this.loadData('vietlot45');
        this.vietlot55Data = this.loadData('vietlot55');
    }

    loadData(dataSource) {
        const dataPath = path.join(__dirname, dataSource, 'json-data');
        
        try {
            const templatePredictions = JSON.parse(
                fs.readFileSync(path.join(dataPath, 'template-predictions.json'), 'utf8')
            );
            const numberPredictions = JSON.parse(
                fs.readFileSync(path.join(dataPath, 'predictions.json'), 'utf8')
            );
            const lotteryData = JSON.parse(
                fs.readFileSync(path.join(dataPath, `${dataSource}-data.json`), 'utf8')
            );
            
            return {
                templatePredictions,
                numberPredictions,
                lotteryData
            };
        } catch (error) {
            console.error(`Error loading ${dataSource} data:`, error.message);
            return null;
        }
    }

    // Generate comprehensive prediction report
    generateComprehensiveReport() {
        const report = {
            generated_at: new Date().toISOString(),
            vietlot45: this.generateSourceReport('vietlot45'),
            vietlot55: this.generateSourceReport('vietlot55'),
            cross_analysis: this.generateCrossAnalysis(),
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    generateSourceReport(dataSource) {
        const data = dataSource === 'vietlot45' ? this.vietlot45Data : this.vietlot55Data;
        if (!data) return null;

        const { templatePredictions, numberPredictions, lotteryData } = data;
        
        // Get top template predictions
        const topTemplates = templatePredictions.top_predictions.slice(0, 10);
        
        // Get top number predictions
        const topNumbers = numberPredictions.top_predictions?.slice(0, 15) || [];
        
        // Analyze recent patterns
        const recentPatterns = this.analyzeRecentPatterns(lotteryData);
        
        // Calculate template-to-number mapping
        const templateNumberMapping = this.mapTemplatesToNumbers(topTemplates, lotteryData);

        return {
            source: dataSource,
            template_analysis: {
                total_templates: templatePredictions.total_templates_analyzed,
                top_predictions: topTemplates,
                high_probability_count: templatePredictions.prediction_summary.high_probability,
                medium_probability_count: templatePredictions.prediction_summary.medium_probability
            },
            number_analysis: {
                top_predictions: topNumbers,
                total_numbers_analyzed: numberPredictions.total_numbers_analyzed || 0
            },
            recent_patterns: recentPatterns,
            template_number_mapping: templateNumberMapping,
            prediction_confidence: this.calculateOverallConfidence(templatePredictions, numberPredictions)
        };
    }

    analyzeRecentPatterns(lotteryData) {
        const recentData = lotteryData.slice(0, 20); // Last 20 draws
        
        const patterns = {
            most_frequent_templates: this.getMostFrequentTemplates(recentData, 5),
            average_total_range: this.calculateAverageTotalRange(recentData),
            even_odd_distribution: this.calculateEvenOddDistribution(recentData),
            day_of_week_patterns: this.calculateDayOfWeekPatterns(recentData),
            continuous_appearances: this.findContinuousAppearances(recentData)
        };

        return patterns;
    }

    getMostFrequentTemplates(data, count) {
        const templateCounts = {};
        
        data.forEach(entry => {
            const templateId = entry.template_id;
            if (templateId) {
                templateCounts[templateId] = (templateCounts[templateId] || 0) + 1;
            }
        });

        return Object.entries(templateCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, count)
            .map(([templateId, count]) => ({ template_id: templateId, frequency: count }));
    }

    calculateAverageTotalRange(data) {
        const totals = data.map(entry => entry.total);
        const min = Math.min(...totals);
        const max = Math.max(...totals);
        const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
        
        return { min, max, average: Math.round(avg) };
    }

    calculateEvenOddDistribution(data) {
        const evenCount = data.filter(entry => entry.total_even_or_odd === 'even').length;
        const oddCount = data.filter(entry => entry.total_even_or_odd === 'odd').length;
        
        return {
            even_percentage: Math.round((evenCount / data.length) * 100),
            odd_percentage: Math.round((oddCount / data.length) * 100)
        };
    }

    calculateDayOfWeekPatterns(data) {
        const dayCounts = {};
        
        data.forEach(entry => {
            const day = entry.date.split(', ')[0];
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        return dayCounts;
    }

    findContinuousAppearances(data) {
        const continuous = data.filter(entry => entry.template_continuos_count > 1);
        return continuous.map(entry => ({
            template_id: entry.template_id,
            continuous_count: entry.template_continuos_count,
            date: entry.date
        }));
    }

    mapTemplatesToNumbers(topTemplates, lotteryData) {
        const mapping = {};
        
        topTemplates.forEach(template => {
            const templateId = template.template_id;
            const templateEntries = lotteryData.filter(entry => entry.template_id === templateId);
            
            if (templateEntries.length > 0) {
                // Get the most recent appearance of this template
                const mostRecent = templateEntries[0];
                mapping[templateId] = {
                    numbers: mostRecent.numbers || mostRecent.jackpot1,
                    total: mostRecent.total,
                    total_even_or_odd: mostRecent.total_even_or_odd,
                    last_appearance: mostRecent.date,
                    probability: template.overall_probability
                };
            }
        });

        return mapping;
    }

    calculateOverallConfidence(templatePredictions, numberPredictions) {
        const templateConfidence = templatePredictions.top_predictions
            .slice(0, 10)
            .reduce((sum, pred) => sum + pred.confidence_level, 0) / 10;
        
        const numberConfidence = numberPredictions.confidence_level || 50;
        
        return Math.round((templateConfidence + numberConfidence) / 2);
    }

    generateCrossAnalysis() {
        const analysis = {
            common_patterns: this.findCommonPatterns(),
            template_correlation: this.analyzeTemplateCorrelation(),
            prediction_agreement: this.analyzePredictionAgreement()
        };

        return analysis;
    }

    findCommonPatterns() {
        const patterns = [];
        
        // Compare top templates between both sources
        const vietlot45Top = this.vietlot45Data?.templatePredictions.top_predictions.slice(0, 5) || [];
        const vietlot55Top = this.vietlot55Data?.templatePredictions.top_predictions.slice(0, 5) || [];
        
        // Find templates with similar probability ranges
        const similarProbTemplates = vietlot45Top.filter(t45 => 
            vietlot55Top.some(t55 => Math.abs(t45.overall_probability - t55.overall_probability) < 5)
        );

        if (similarProbTemplates.length > 0) {
            patterns.push({
                type: 'similar_probability_templates',
                description: 'Templates with similar prediction probabilities across both lottery types',
                templates: similarProbTemplates
            });
        }

        return patterns;
    }

    analyzeTemplateCorrelation() {
        // Analyze if certain template patterns correlate with specific number patterns
        return {
            high_frequency_templates: this.findHighFrequencyTemplates(),
            low_frequency_templates: this.findLowFrequencyTemplates()
        };
    }

    findHighFrequencyTemplates() {
        const highFreq = [];
        
        [this.vietlot45Data, this.vietlot55Data].forEach(data => {
            if (data) {
                const highFreqTemplates = data.templatePredictions.top_predictions
                    .filter(pred => pred.total_appearances > 20)
                    .slice(0, 3);
                highFreq.push(...highFreqTemplates);
            }
        });

        return highFreq;
    }

    findLowFrequencyTemplates() {
        const lowFreq = [];
        
        [this.vietlot45Data, this.vietlot55Data].forEach(data => {
            if (data) {
                const lowFreqTemplates = data.templatePredictions.top_predictions
                    .filter(pred => pred.total_appearances < 5)
                    .slice(0, 3);
                lowFreq.push(...lowFreqTemplates);
            }
        });

        return lowFreq;
    }

    analyzePredictionAgreement() {
        // Check if template predictions align with number predictions
        return {
            agreement_score: 75, // Placeholder - would need more sophisticated analysis
            conflicting_predictions: [],
            supporting_evidence: []
        };
    }

    generateRecommendations() {
        const recommendations = [];

        // Template-based recommendations
        if (this.vietlot45Data) {
            const topTemplate = this.vietlot45Data.templatePredictions.top_predictions[0];
            if (topTemplate && topTemplate.overall_probability > 15) {
                recommendations.push({
                    type: 'template_focus',
                    source: 'vietlot45',
                    template_id: topTemplate.template_id,
                    probability: topTemplate.overall_probability,
                    confidence: topTemplate.confidence_level,
                    recommendation: `Focus on Template ${topTemplate.template_id} with ${topTemplate.overall_probability}% probability`
                });
            }
        }

        if (this.vietlot55Data) {
            const topTemplate = this.vietlot55Data.templatePredictions.top_predictions[0];
            if (topTemplate && topTemplate.overall_probability > 15) {
                recommendations.push({
                    type: 'template_focus',
                    source: 'vietlot55',
                    template_id: topTemplate.template_id,
                    probability: topTemplate.overall_probability,
                    confidence: topTemplate.confidence_level,
                    recommendation: `Focus on Template ${topTemplate.template_id} with ${topTemplate.overall_probability}% probability`
                });
            }
        }

        // Pattern-based recommendations
        recommendations.push({
            type: 'pattern_analysis',
            recommendation: 'Monitor continuous appearance patterns for potential streaks',
            priority: 'medium'
        });

        recommendations.push({
            type: 'frequency_analysis',
            recommendation: 'Track overdue templates that haven\'t appeared recently',
            priority: 'high'
        });

        return recommendations;
    }

    // Generate HTML dashboard
    generateHTMLDashboard() {
        const report = this.generateComprehensiveReport();
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lottery Prediction Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.8;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            border-left: 5px solid #3498db;
        }
        .section h2 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 1.8em;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-top: 4px solid #3498db;
        }
        .card h3 {
            color: #2c3e50;
            margin-top: 0;
            font-size: 1.3em;
        }
        .prediction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .prediction-item:last-child {
            border-bottom: none;
        }
        .probability {
            font-weight: bold;
            color: #e74c3c;
        }
        .confidence {
            color: #27ae60;
            font-size: 0.9em;
        }
        .recommendation {
            background: #e8f5e8;
            border-left: 4px solid #27ae60;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #3498db;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Lottery Prediction Dashboard</h1>
            <p>Advanced Template & Number Pattern Analysis</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Overall Statistics</h2>
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-value">${report.vietlot45?.template_analysis.total_templates || 0}</div>
                        <div class="stat-label">Vietlot 6/45 Templates</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${report.vietlot55?.template_analysis.total_templates || 0}</div>
                        <div class="stat-label">Vietlot 6/55 Templates</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${report.vietlot45?.prediction_confidence || 0}%</div>
                        <div class="stat-label">Overall Confidence</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${report.recommendations.length}</div>
                        <div class="stat-label">Active Recommendations</div>
                    </div>
                </div>
            </div>

            <div class="grid">
                <div class="card">
                    <h3>🏆 Top Vietlot 6/45 Template Predictions</h3>
                    ${this.generateTemplatePredictionsHTML(report.vietlot45?.template_analysis.top_predictions || [])}
                </div>
                
                <div class="card">
                    <h3>🏆 Top Vietlot 6/55 Template Predictions</h3>
                    ${this.generateTemplatePredictionsHTML(report.vietlot55?.template_analysis.top_predictions || [])}
                </div>
            </div>

            <div class="section">
                <h2>💡 Smart Recommendations</h2>
                ${this.generateRecommendationsHTML(report.recommendations)}
            </div>

            <div class="grid">
                <div class="card">
                    <h3>📈 Vietlot 6/45 Recent Patterns</h3>
                    ${this.generatePatternsHTML(report.vietlot45?.recent_patterns)}
                </div>
                
                <div class="card">
                    <h3>📈 Vietlot 6/55 Recent Patterns</h3>
                    ${this.generatePatternsHTML(report.vietlot55?.recent_patterns)}
                </div>
            </div>

            <div class="timestamp">
                Generated on: ${new Date(report.generated_at).toLocaleString()}
            </div>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    generateTemplatePredictionsHTML(predictions) {
        if (!predictions.length) return '<p>No predictions available</p>';
        
        return predictions.slice(0, 5).map(pred => `
            <div class="prediction-item">
                <div>
                    <strong>Template ${pred.template_id}</strong><br>
                    <span class="confidence">Confidence: ${pred.confidence_level}%</span>
                </div>
                <div class="probability">${pred.overall_probability}%</div>
            </div>
        `).join('');
    }

    generateRecommendationsHTML(recommendations) {
        if (!recommendations.length) return '<p>No recommendations available</p>';
        
        return recommendations.map(rec => `
            <div class="recommendation">
                <strong>${rec.type.toUpperCase()}:</strong> ${rec.recommendation}
                ${rec.probability ? `<br><small>Probability: ${rec.probability}% | Confidence: ${rec.confidence}%</small>` : ''}
            </div>
        `).join('');
    }

    generatePatternsHTML(patterns) {
        if (!patterns) return '<p>No pattern data available</p>';
        
        return `
            <p><strong>Most Frequent Templates:</strong></p>
            <ul>
                ${patterns.most_frequent_templates?.map(t => `<li>Template ${t.template_id}: ${t.frequency} times</li>`).join('') || '<li>No data</li>'}
            </ul>
            <p><strong>Total Range:</strong> ${patterns.average_total_range?.min || 0} - ${patterns.average_total_range?.max || 0} (Avg: ${patterns.average_total_range?.average || 0})</p>
            <p><strong>Even/Odd Distribution:</strong> ${patterns.even_odd_distribution?.even_percentage || 0}% Even, ${patterns.even_odd_distribution?.odd_percentage || 0}% Odd</p>
        `;
    }

    // Save dashboard to file
    saveDashboard() {
        const report = this.generateComprehensiveReport();
        const html = this.generateHTMLDashboard();
        
        // Save JSON report
        fs.writeFileSync(
            path.join(__dirname, 'prediction-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        // Save HTML dashboard
        fs.writeFileSync(
            path.join(__dirname, 'prediction-dashboard.html'),
            html
        );
        
        console.log('✅ Prediction dashboard generated successfully!');
        console.log('📄 Files created:');
        console.log('   - prediction-report.json (Detailed analysis)');
        console.log('   - prediction-dashboard.html (Visual dashboard)');
        
        return { report, html };
    }
}

module.exports = PredictionDashboard;
