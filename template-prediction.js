const fs = require('fs');
const path = require('path');

class TemplatePredictor {
    constructor(data, dataSource) {
        this.data = data;
        this.dataSource = dataSource;
        this.templateStats = this.analyzeTemplatePatterns();
    }

    // Analyze template patterns and calculate statistics
    analyzeTemplatePatterns() {
        const templateStats = new Map();
        
        // Group data by template_id
        this.data.forEach(entry => {
            const templateId = entry.template_id;
            if (!templateId) return;
            
            if (!templateStats.has(templateId)) {
                templateStats.set(templateId, {
                    id: templateId,
                    totalAppearances: 0,
                    continuousSequences: [],
                    comebackIntervals: [],
                    lastAppearance: null,
                    averageComebackInterval: 0,
                    maxContinuousCount: 0,
                    recentActivity: []
                });
            }
            
            const stats = templateStats.get(templateId);
            stats.totalAppearances++;
            stats.lastAppearance = entry.date;
            
            // Track comeback intervals
            if (entry.template_appear_comback_from_prev_count > 0) {
                stats.comebackIntervals.push(entry.template_appear_comback_from_prev_count);
            }
            
            // Track continuous sequences
            if (entry.template_continuos_count > 1) {
                stats.maxContinuousCount = Math.max(stats.maxContinuousCount, entry.template_continuos_count);
            }
            
            // Track recent activity (last 50 appearances)
            stats.recentActivity.push({
                date: entry.date,
                comebackInterval: entry.template_appear_comback_from_prev_count,
                continuousCount: entry.template_continuos_count
            });
            
            if (stats.recentActivity.length > 50) {
                stats.recentActivity.shift();
            }
        });
        
        // Calculate averages and patterns
        templateStats.forEach(stats => {
            if (stats.comebackIntervals.length > 0) {
                stats.averageComebackInterval = stats.comebackIntervals.reduce((a, b) => a + b, 0) / stats.comebackIntervals.length;
            }
            
            // Calculate recent trend (last 10 appearances)
            const recent10 = stats.recentActivity.slice(-10);
            if (recent10.length > 0) {
                const recentComebackAvg = recent10
                    .filter(item => item.comebackInterval > 0)
                    .reduce((sum, item) => sum + item.comebackInterval, 0) / 
                    recent10.filter(item => item.comebackInterval > 0).length;
                
                stats.recentComebackTrend = recentComebackAvg || stats.averageComebackInterval;
            }
        });
        
        return templateStats;
    }

    // Calculate probability based on comeback interval patterns
    calculateComebackProbability(templateId, daysSinceLastAppearance) {
        const stats = this.templateStats.get(templateId);
        if (!stats || stats.comebackIntervals.length === 0) return 0;
        
        // Find similar comeback intervals
        const similarIntervals = stats.comebackIntervals.filter(interval => 
            Math.abs(interval - daysSinceLastAppearance) <= 2
        );
        
        const probability = similarIntervals.length / stats.comebackIntervals.length;
        return Math.min(probability * 100, 95); // Cap at 95%
    }

    // Calculate probability based on continuous appearance patterns
    calculateContinuousProbability(templateId, currentContinuousCount) {
        const stats = this.templateStats.get(templateId);
        if (!stats) return 0;
        
        // Find how often this template continues after reaching current continuous count
        const continuesAfterCurrent = stats.recentActivity.filter(item => 
            item.continuousCount > currentContinuousCount
        ).length;
        
        const reachesCurrent = stats.recentActivity.filter(item => 
            item.continuousCount >= currentContinuousCount
        ).length;
        
        if (reachesCurrent === 0) return 0;
        return (continuesAfterCurrent / reachesCurrent) * 100;
    }

    // Calculate probability based on frequency patterns
    calculateFrequencyProbability(templateId) {
        const stats = this.templateStats.get(templateId);
        if (!stats) return 0;
        
        const totalDraws = this.data.length;
        const expectedFrequency = stats.totalAppearances / totalDraws;
        
        // Calculate how many draws since last appearance
        const lastAppearanceIndex = this.data.findIndex(entry => 
            entry.template_id === templateId && entry.date === stats.lastAppearance
        );
        
        const drawsSinceLast = totalDraws - lastAppearanceIndex - 1;
        const expectedDrawsSinceLast = 1 / expectedFrequency;
        
        // Higher probability if overdue
        if (drawsSinceLast > expectedDrawsSinceLast) {
            return Math.min((drawsSinceLast / expectedDrawsSinceLast) * 25, 80);
        }
        
        return Math.max(5, 25 - (drawsSinceLast / expectedDrawsSinceLast) * 20);
    }

    // Calculate probability based on recent trend
    calculateTrendProbability(templateId) {
        const stats = this.templateStats.get(templateId);
        if (!stats || !stats.recentComebackTrend) return 0;
        
        const lastAppearanceIndex = this.data.findIndex(entry => 
            entry.template_id === templateId && entry.date === stats.lastAppearance
        );
        
        const drawsSinceLast = this.data.length - lastAppearanceIndex - 1;
        const daysSinceLast = drawsSinceLast * (this.dataSource === 'vietlot45' ? 2 : 3); // Approximate days
        
        // Compare with recent trend
        const trendDiff = Math.abs(daysSinceLast - stats.recentComebackTrend);
        const trendProbability = Math.max(0, 50 - trendDiff * 5);
        
        return trendProbability;
    }

    // Main prediction method
    predictTemplateProbabilities() {
        const predictions = [];
        const currentDate = new Date();
        
        this.templateStats.forEach((stats, templateId) => {
            // Calculate days since last appearance
            const lastAppearanceIndex = this.data.findIndex(entry => 
                entry.template_id === templateId && entry.date === stats.lastAppearance
            );
            
            const drawsSinceLast = this.data.length - lastAppearanceIndex - 1;
            const daysSinceLast = drawsSinceLast * (this.dataSource === 'vietlot45' ? 2 : 3);
            
            // Get current continuous count
            const currentContinuousCount = stats.recentActivity.length > 0 ? 
                stats.recentActivity[stats.recentActivity.length - 1].continuousCount : 0;
            
            // Calculate different probability components
            const comebackProb = this.calculateComebackProbability(templateId, daysSinceLast);
            const continuousProb = this.calculateContinuousProbability(templateId, currentContinuousCount);
            const frequencyProb = this.calculateFrequencyProbability(templateId);
            const trendProb = this.calculateTrendProbability(templateId);
            
            // Weighted average of probabilities
            const weightedProbability = (
                comebackProb * 0.35 +      // Comeback patterns (35% weight)
                continuousProb * 0.25 +    // Continuous patterns (25% weight)
                frequencyProb * 0.25 +     // Frequency patterns (25% weight)
                trendProb * 0.15           // Recent trends (15% weight)
            );
            
            predictions.push({
                template_id: templateId,
                total_appearances: stats.totalAppearances,
                days_since_last: daysSinceLast,
                current_continuous_count: currentContinuousCount,
                average_comeback_interval: Math.round(stats.averageComebackInterval * 10) / 10,
                max_continuous_count: stats.maxContinuousCount,
                probability_components: {
                    comeback_pattern: Math.round(comebackProb * 10) / 10,
                    continuous_pattern: Math.round(continuousProb * 10) / 10,
                    frequency_pattern: Math.round(frequencyProb * 10) / 10,
                    recent_trend: Math.round(trendProb * 10) / 10
                },
                overall_probability: Math.round(weightedProbability * 10) / 10,
                confidence_level: this.calculateConfidenceLevel(stats),
                last_appearance: stats.lastAppearance
            });
        });
        
        // Sort by overall probability (highest first)
        predictions.sort((a, b) => b.overall_probability - a.overall_probability);
        
        return predictions;
    }

    // Calculate confidence level based on data quality
    calculateConfidenceLevel(stats) {
        let confidence = 0;
        
        // More appearances = higher confidence
        if (stats.totalAppearances >= 20) confidence += 30;
        else if (stats.totalAppearances >= 10) confidence += 20;
        else if (stats.totalAppearances >= 5) confidence += 10;
        
        // More comeback intervals = higher confidence
        if (stats.comebackIntervals.length >= 10) confidence += 25;
        else if (stats.comebackIntervals.length >= 5) confidence += 15;
        else if (stats.comebackIntervals.length >= 2) confidence += 10;
        
        // Recent activity = higher confidence
        if (stats.recentActivity.length >= 20) confidence += 25;
        else if (stats.recentActivity.length >= 10) confidence += 15;
        else if (stats.recentActivity.length >= 5) confidence += 10;
        
        // Consistent patterns = higher confidence
        const comebackVariance = this.calculateVariance(stats.comebackIntervals);
        if (comebackVariance < 10) confidence += 20;
        else if (comebackVariance < 20) confidence += 10;
        
        return Math.min(confidence, 100);
    }

    // Calculate variance of an array
    calculateVariance(array) {
        if (array.length === 0) return 0;
        const mean = array.reduce((a, b) => a + b, 0) / array.length;
        const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
        return Math.sqrt(variance);
    }

    // Generate prediction report
    generatePredictionReport() {
        const predictions = this.predictTemplateProbabilities();
        
        // Get top predictions
        const topPredictions = predictions.slice(0, 20);
        
        // Calculate summary statistics
        const totalTemplates = predictions.length;
        const highProbabilityTemplates = predictions.filter(p => p.overall_probability > 50).length;
        const mediumProbabilityTemplates = predictions.filter(p => p.overall_probability > 25 && p.overall_probability <= 50).length;
        
        return {
            data_source: this.dataSource,
            total_templates_analyzed: totalTemplates,
            prediction_summary: {
                high_probability: highProbabilityTemplates,
                medium_probability: mediumProbabilityTemplates,
                low_probability: totalTemplates - highProbabilityTemplates - mediumProbabilityTemplates
            },
            top_predictions: topPredictions,
            all_predictions: predictions,
            generated_at: new Date().toISOString(),
            methodology: {
                comeback_pattern_weight: 35,
                continuous_pattern_weight: 25,
                frequency_pattern_weight: 25,
                recent_trend_weight: 15
            }
        };
    }
}

module.exports = TemplatePredictor;
