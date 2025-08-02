/**
 * Excel-like FORECAST & TREND Implementation for Lottery Prediction
 * Based on requirement.txt - implementing statistical forecasting methods
 */

class LotteryPredictor {
    constructor(historicalData, totalNumbers) {
        this.data = historicalData;
        this.totalNumbers = totalNumbers;
        this.timeSeriesData = this.prepareTimeSeriesData();
    }

    /**
     * Prepare time series data for each number
     * Creates frequency data over time periods
     */
    prepareTimeSeriesData() {
        const timeSeriesData = {};
        
        // Initialize data structure for each number
        for (let num = 1; num <= this.totalNumbers; num++) {
            timeSeriesData[num] = [];
        }
        
        // Group data by time periods (every 10 draws for smoother trends)
        const periodSize = 10;
        const totalDraws = this.data.length;
        
        for (let period = 0; period < Math.floor(totalDraws / periodSize); period++) {
            const startIdx = period * periodSize;
            const endIdx = Math.min(startIdx + periodSize, totalDraws);
            const periodDraws = this.data.slice(startIdx, endIdx);
            
            // Count frequency of each number in this period
            const periodFrequency = {};
            for (let num = 1; num <= this.totalNumbers; num++) {
                periodFrequency[num] = 0;
            }
            
            periodDraws.forEach(draw => {
                let numbersToAnalyze;
                
                // For vietlot55, use jackpot1 (first 6 numbers) for prediction
                if (draw.jackpot1) {
                    numbersToAnalyze = draw.jackpot1.split(' ').map(n => parseInt(n));
                } else {
                    numbersToAnalyze = draw.numbers.split(' ').map(n => parseInt(n));
                }
                
                numbersToAnalyze.forEach(num => {
                    if (num >= 1 && num <= this.totalNumbers) {
                        periodFrequency[num]++;
                    }
                });
            });
            
            // Store frequency as percentage for this period
            for (let num = 1; num <= this.totalNumbers; num++) {
                const frequency = (periodFrequency[num] / periodDraws.length) * 100;
                timeSeriesData[num].push({
                    period: period,
                    frequency: frequency,
                    drawCount: periodDraws.length
                });
            }
        }
        
        return timeSeriesData;
    }

    /**
     * Excel-like FORECAST function
     * Predicts future value using linear regression
     */
    forecast(x, yValues, xValues) {
        const n = yValues.length;
        if (n !== xValues.length || n < 2) return 0;
        
        // Calculate means
        const meanX = xValues.reduce((sum, val) => sum + val, 0) / n;
        const meanY = yValues.reduce((sum, val) => sum + val, 0) / n;
        
        // Calculate slope (b) and intercept (a)
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < n; i++) {
            numerator += (xValues[i] - meanX) * (yValues[i] - meanY);
            denominator += (xValues[i] - meanX) ** 2;
        }
        
        const slope = denominator === 0 ? 0 : numerator / denominator;
        const intercept = meanY - slope * meanX;
        
        // Forecast: y = a + bx
        return intercept + slope * x;
    }

    /**
     * Excel-like TREND function
     * Returns trend values along a linear trend line
     */
    trend(newXValues, yValues, xValues) {
        return newXValues.map(x => this.forecast(x, yValues, xValues));
    }

    /**
     * Calculate trend direction and strength for each number
     */
    calculateTrends() {
        const trends = {};
        
        for (let num = 1; num <= this.totalNumbers; num++) {
            const data = this.timeSeriesData[num];
            if (data.length < 3) {
                trends[num] = { direction: 'neutral', strength: 0, forecast: 0 };
                continue;
            }
            
            const xValues = data.map(d => d.period);
            const yValues = data.map(d => d.frequency);
            
            // Calculate trend using linear regression
            const nextPeriod = Math.max(...xValues) + 1;
            const forecastValue = this.forecast(nextPeriod, yValues, xValues);
            
            // Calculate trend strength (R-squared)
            const meanY = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
            const predictions = this.trend(xValues, yValues, xValues);
            
            let ssRes = 0; // Sum of squared residuals
            let ssTot = 0; // Total sum of squares
            
            for (let i = 0; i < yValues.length; i++) {
                ssRes += (yValues[i] - predictions[i]) ** 2;
                ssTot += (yValues[i] - meanY) ** 2;
            }
            
            const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
            
            // Determine trend direction
            const firstValue = yValues[0];
            const lastValue = yValues[yValues.length - 1];
            const direction = lastValue > firstValue ? 'up' : 
                            lastValue < firstValue ? 'down' : 'neutral';
            
            trends[num] = {
                direction: direction,
                strength: Math.abs(rSquared),
                forecast: Math.max(0, forecastValue), // Ensure non-negative
                currentFrequency: lastValue,
                change: lastValue - firstValue,
                confidence: rSquared > 0.5 ? 'high' : rSquared > 0.2 ? 'medium' : 'low'
            };
        }
        
        return trends;
    }

    /**
     * Generate number predictions based on FORECAST & TREND analysis
     */
    generatePredictions(count = 6) {
        const trends = this.calculateTrends();
        
        // Create prediction scores for each number
        const predictions = [];
        
        for (let num = 1; num <= this.totalNumbers; num++) {
            const trend = trends[num];
            
            // Base score from forecast
            let score = trend.forecast;
            
            // Boost score for upward trends
            if (trend.direction === 'up') {
                score *= (1 + trend.strength);
            }
            
            // Reduce score for downward trends
            if (trend.direction === 'down') {
                score *= (1 - trend.strength * 0.5);
            }
            
            // Apply confidence multiplier
            const confidenceMultiplier = {
                'high': 1.2,
                'medium': 1.0,
                'low': 0.8
            };
            
            score *= confidenceMultiplier[trend.confidence];
            
            predictions.push({
                number: num,
                score: score,
                trend: trend.direction,
                strength: trend.strength,
                confidence: trend.confidence,
                forecast: trend.forecast
            });
        }
        
        // Sort by score and return top numbers
        predictions.sort((a, b) => b.score - a.score);
        return predictions.slice(0, count);
    }

    /**
     * Generate hot and cold numbers analysis
     */
    getHotColdAnalysis() {
        const trends = this.calculateTrends();
        const numbers = Object.keys(trends).map(num => ({
            number: parseInt(num),
            ...trends[num]
        }));
        
        // Sort by forecast value
        numbers.sort((a, b) => b.forecast - a.forecast);
        
        const hotNumbers = numbers.slice(0, 10);
        const coldNumbers = numbers.slice(-10).reverse();
        
        return { hotNumbers, coldNumbers };
    }

    /**
     * Get comprehensive prediction report
     */
    getPredictionReport() {
        const predictions = this.generatePredictions();
        const hotCold = this.getHotColdAnalysis();
        const trends = this.calculateTrends();
        
        return {
            predictedNumbers: predictions,
            hotNumbers: hotCold.hotNumbers,
            coldNumbers: hotCold.coldNumbers,
            trends: trends,
            analysisDate: new Date().toISOString(),
            totalDrawsAnalyzed: this.data.length,
            predictionMethod: 'Excel-like FORECAST & TREND Analysis'
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LotteryPredictor;
} else {
    window.LotteryPredictor = LotteryPredictor;
}