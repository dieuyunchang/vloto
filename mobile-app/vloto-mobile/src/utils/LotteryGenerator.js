export class LotteryGenerator {
  static generateSmartNumbers(data, totalNumbers = 45, count = 6) {
    if (!data || !data.summary || data.summary.length === 0) {
      return this.generateRandomNumbers(totalNumbers, count);
    }

    const summary = data.summary;
    const weights = this.calculateWeights(summary);
    
    // Generate numbers using weighted probability
    const selectedNumbers = [];
    let attempts = 0;
    
    while (selectedNumbers.length < count && attempts < 100) {
      const number = this.selectWeightedNumber(weights);
      if (!selectedNumbers.includes(number)) {
        selectedNumbers.push(number);
      }
      attempts++;
    }
    
    // Fill remaining slots with random numbers if needed
    while (selectedNumbers.length < count) {
      const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
      if (!selectedNumbers.includes(randomNum)) {
        selectedNumbers.push(randomNum);
      }
    }
    
    return selectedNumbers.sort((a, b) => a - b);
  }

  static generateByFrequency(data, totalNumbers = 45, count = 6, type = 'balanced') {
    if (!data || !data.summary || data.summary.length === 0) {
      return this.generateRandomNumbers(totalNumbers, count);
    }

    const summary = data.summary.slice().sort((a, b) => b.count - a.count);
    let selectedNumbers = [];

    switch (type) {
      case 'hot':
        // Select from most frequent numbers
        selectedNumbers = summary.slice(0, count).map(item => item.number);
        break;
        
      case 'cold':
        // Select from least frequent numbers
        selectedNumbers = summary.slice(-count).map(item => item.number);
        break;
        
      case 'balanced':
      default:
        // Mix of hot and cold numbers
        const hotCount = Math.floor(count / 2);
        const coldCount = count - hotCount;
        
        const hotNumbers = summary.slice(0, hotCount).map(item => item.number);
        const coldNumbers = summary.slice(-coldCount).map(item => item.number);
        
        selectedNumbers = [...hotNumbers, ...coldNumbers];
        break;
    }
    
    return selectedNumbers.sort((a, b) => a - b);
  }

  static generateByDayOfWeek(data, totalNumbers = 45, count = 6, dayOfWeek = 'sat') {
    if (!data || !data.dayOfWeek || !data.dayOfWeek[dayOfWeek]) {
      return this.generateRandomNumbers(totalNumbers, count);
    }

    const dayData = data.dayOfWeek[dayOfWeek];
    const weights = this.calculateWeights(dayData);
    
    const selectedNumbers = [];
    let attempts = 0;
    
    while (selectedNumbers.length < count && attempts < 100) {
      const number = this.selectWeightedNumber(weights);
      if (!selectedNumbers.includes(number)) {
        selectedNumbers.push(number);
      }
      attempts++;
    }
    
    // Fill remaining slots with random numbers if needed
    while (selectedNumbers.length < count) {
      const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
      if (!selectedNumbers.includes(randomNum)) {
        selectedNumbers.push(randomNum);
      }
    }
    
    return selectedNumbers.sort((a, b) => a - b);
  }

  static generateByMonth(data, totalNumbers = 45, count = 6, month = null) {
    if (!month) {
      month = new Date().getMonth() + 1;
    }
    
    if (!data || !data.month || !data.month[month]) {
      return this.generateRandomNumbers(totalNumbers, count);
    }

    const monthData = data.month[month];
    const weights = this.calculateWeights(monthData);
    
    const selectedNumbers = [];
    let attempts = 0;
    
    while (selectedNumbers.length < count && attempts < 100) {
      const number = this.selectWeightedNumber(weights);
      if (!selectedNumbers.includes(number)) {
        selectedNumbers.push(number);
      }
      attempts++;
    }
    
    // Fill remaining slots with random numbers if needed
    while (selectedNumbers.length < count) {
      const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
      if (!selectedNumbers.includes(randomNum)) {
        selectedNumbers.push(randomNum);
      }
    }
    
    return selectedNumbers.sort((a, b) => a - b);
  }

  static generateByEvenOdd(data, totalNumbers = 45, count = 6, type = 'even') {
    if (!data || !data.evenOdd || !data.evenOdd[type]) {
      return this.generateRandomNumbers(totalNumbers, count);
    }

    const evenOddData = data.evenOdd[type];
    const weights = this.calculateWeights(evenOddData);
    
    const selectedNumbers = [];
    let attempts = 0;
    
    while (selectedNumbers.length < count && attempts < 100) {
      const number = this.selectWeightedNumber(weights);
      if (!selectedNumbers.includes(number)) {
        selectedNumbers.push(number);
      }
      attempts++;
    }
    
    // Fill remaining slots with random numbers if needed
    while (selectedNumbers.length < count) {
      const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
      if (!selectedNumbers.includes(randomNum)) {
        selectedNumbers.push(randomNum);
      }
    }
    
    return selectedNumbers.sort((a, b) => a - b);
  }

  static generateRandomNumbers(totalNumbers = 45, count = 6) {
    const numbers = [];
    
    while (numbers.length < count) {
      const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
    
    return numbers.sort((a, b) => a - b);
  }

  static generateMultipleGroups(data, totalNumbers = 45, count = 6, groupCount = 5, strategy = 'smart') {
    const groups = [];
    
    for (let i = 0; i < groupCount; i++) {
      let numbers;
      
      switch (strategy) {
        case 'hot':
          numbers = this.generateByFrequency(data, totalNumbers, count, 'hot');
          break;
        case 'cold':
          numbers = this.generateByFrequency(data, totalNumbers, count, 'cold');
          break;
        case 'balanced':
          numbers = this.generateByFrequency(data, totalNumbers, count, 'balanced');
          break;
        case 'random':
          numbers = this.generateRandomNumbers(totalNumbers, count);
          break;
        case 'smart':
        default:
          numbers = this.generateSmartNumbers(data, totalNumbers, count);
          break;
      }
      
      groups.push({
        id: i + 1,
        numbers,
        strategy,
      });
    }
    
    return groups;
  }

  static calculateWeights(summary) {
    const weights = [];
    const maxCount = Math.max(...summary.map(item => item.count));
    
    summary.forEach(item => {
      // Normalize weights (higher frequency = higher weight)
      const weight = maxCount > 0 ? (item.count / maxCount) * 100 : 1;
      weights.push({
        number: item.number,
        weight: Math.max(weight, 1), // Minimum weight of 1
      });
    });
    
    return weights;
  }

  static selectWeightedNumber(weights) {
    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
    const randomValue = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const item of weights) {
      currentWeight += item.weight;
      if (randomValue <= currentWeight) {
        return item.number;
      }
    }
    
    // Fallback to random selection
    return weights[Math.floor(Math.random() * weights.length)].number;
  }

  static getNumberFrequencyClass(number, summary, totalNumbers = 45) {
    if (!summary || summary.length === 0) return 'medium';
    
    const item = summary.find(s => s.number === number);
    if (!item) return 'medium';
    
    const sortedCounts = summary.map(s => s.count).sort((a, b) => b - a);
    const percentile = (sortedCounts.indexOf(item.count) + 1) / sortedCounts.length;
    
    if (totalNumbers === 45) {
      // 7-tier system for Mega 6/45
      if (percentile <= 0.1) return 'superhot';
      if (percentile <= 0.2) return 'veryhot';
      if (percentile <= 0.35) return 'hot';
      if (percentile <= 0.65) return 'medium';
      if (percentile <= 0.8) return 'cold';
      if (percentile <= 0.9) return 'verycold';
      return 'supercold';
    } else {
      // 5-tier system for Mega 6/55
      if (percentile <= 0.2) return 'veryhot';
      if (percentile <= 0.4) return 'hot';
      if (percentile <= 0.6) return 'medium';
      if (percentile <= 0.8) return 'cold';
      return 'verycold';
    }
  }

  static getFrequencyColors(totalNumbers = 45) {
    if (totalNumbers === 45) {
      return {
        superhot: '#8B0000',    // Dark red
        veryhot: '#DC143C',     // Crimson
        hot: '#FF6347',         // Tomato
        medium: '#FFD700',      // Gold
        cold: '#32CD32',        // Lime green
        verycold: '#4169E1',    // Royal blue
        supercold: '#800080',   // Purple
      };
    } else {
      return {
        veryhot: '#DC143C',     // Crimson
        hot: '#FF6347',         // Tomato
        medium: '#FFD700',      // Gold
        cold: '#32CD32',        // Lime green
        verycold: '#4169E1',    // Royal blue
      };
    }
  }

  static analyzeNumbers(numbers, data, totalNumbers = 45) {
    if (!data || !data.summary) return null;
    
    const analysis = {
      numbers,
      frequencies: [],
      totalAppearances: 0,
      averageFrequency: 0,
      hotNumbers: 0,
      coldNumbers: 0,
      mediumNumbers: 0,
    };
    
    numbers.forEach(number => {
      const item = data.summary.find(s => s.number === number);
      const frequency = item ? item.count : 0;
      const frequencyClass = this.getNumberFrequencyClass(number, data.summary, totalNumbers);
      
      analysis.frequencies.push({
        number,
        frequency,
        class: frequencyClass,
        percentage: item ? item.percentage : 0,
      });
      
      analysis.totalAppearances += frequency;
      
      if (['superhot', 'veryhot', 'hot'].includes(frequencyClass)) {
        analysis.hotNumbers++;
      } else if (['cold', 'verycold', 'supercold'].includes(frequencyClass)) {
        analysis.coldNumbers++;
      } else {
        analysis.mediumNumbers++;
      }
    });
    
    analysis.averageFrequency = analysis.totalAppearances / numbers.length;
    
    return analysis;
  }
} 
