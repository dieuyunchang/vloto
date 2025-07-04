import axios from 'axios';

const BASE_URL = 'https://www.ketquadientoan.com';

export class DataService {
  static async fetchVietlot45Data() {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 6); // Get 6 months of data
      
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const url = `${BASE_URL}/tat-ca-ky-xo-so-mega-6-45.html?datef=${formatDate(startDate)}&datet=${formatDate(today)}`;
      
      // Note: In a real mobile app, you'd need a backend proxy to handle CORS
      // For now, we'll use the existing JSON data as fallback
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36'
        }
      });

      return this.parseVietlot45Data(response.data);
    } catch (error) {
      console.error('Error fetching Vietlot 45 data:', error);
      // Fallback to bundled data
      return this.getBundledVietlot45Data();
    }
  }

  static async fetchVietlot55Data() {
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setMonth(startDate.getMonth() - 6);
      
      const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const url = `${BASE_URL}/tat-ca-ky-xo-so-power-655.html?datef=${formatDate(startDate)}&datet=${formatDate(today)}`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36'
        }
      });

      return this.parseVietlot55Data(response.data);
    } catch (error) {
      console.error('Error fetching Vietlot 55 data:', error);
      // Fallback to bundled data
      return this.getBundledVietlot55Data();
    }
  }

  static parseVietlot45Data(html) {
    // Simple HTML parsing for mobile
    // In a real app, you'd use a proper HTML parser
    const results = [];
    
    // Extract table rows (simplified parsing)
    const tableMatches = html.match(/<tr[^>]*>.*?<\/tr>/gs);
    
    if (tableMatches) {
      tableMatches.forEach(row => {
        const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
        if (cells && cells.length >= 3) {
          const date = cells[0].replace(/<[^>]*>/g, '').trim();
          const numbersText = cells[1].replace(/<[^>]*>/g, '').trim();
          const prize = cells[2].replace(/<[^>]*>/g, '').trim();
          
          const numbers = numbersText.match(/\b\d{1,2}\b/g);
          
          if (date && numbers && numbers.length === 6 && prize) {
            results.push({
              date,
              numbers: numbers.join(' '),
              prize,
            });
          }
        }
      });
    }

    return this.processLotteryData(results, 45);
  }

  static parseVietlot55Data(html) {
    const results = [];
    
    const tableMatches = html.match(/<tr[^>]*>.*?<\/tr>/gs);
    
    if (tableMatches) {
      tableMatches.forEach(row => {
        const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
        if (cells && cells.length >= 3) {
          const date = cells[0].replace(/<[^>]*>/g, '').trim();
          const numbersText = cells[1].replace(/<[^>]*>/g, '').trim();
          const prize = cells[2].replace(/<[^>]*>/g, '').trim();
          
          const numbers = numbersText.match(/\b\d{1,2}\b/g);
          
          if (date && numbers && numbers.length === 6 && prize) {
            results.push({
              date,
              numbers: numbers.join(' '),
              prize,
            });
          }
        }
      });
    }

    return this.processLotteryData(results, 55);
  }

  static processLotteryData(draws, totalNumbers) {
    const summary = this.calculateSummary(draws, totalNumbers);
    const dayOfWeekSummary = this.calculateDayOfWeekSummary(draws, totalNumbers);
    const dayOfMonthSummary = this.calculateDayOfMonthSummary(draws, totalNumbers);
    const monthSummary = this.calculateMonthSummary(draws, totalNumbers);
    const evenOddSummary = this.calculateEvenOddSummary(draws, totalNumbers);

    return {
      draws,
      summary,
      dayOfWeek: dayOfWeekSummary,
      dayOfMonth: dayOfMonthSummary,
      month: monthSummary,
      evenOdd: evenOddSummary,
    };
  }

  static calculateSummary(draws, totalNumbers) {
    const frequency = Array(totalNumbers).fill(0);
    
    draws.forEach(draw => {
      if (draw.numbers) {
        draw.numbers.split(' ').forEach(num => {
          const number = parseInt(num);
          if (number >= 1 && number <= totalNumbers) {
            frequency[number - 1]++;
          }
        });
      }
    });

    return frequency.map((count, index) => ({
      number: index + 1,
      count,
      percentage: draws.length > 0 ? ((count / draws.length) * 100).toFixed(2) : 0,
    }));
  }

  static calculateDayOfWeekSummary(draws, totalNumbers) {
    const dayData = {
      tue: Array(totalNumbers).fill(0),
      thu: Array(totalNumbers).fill(0),
      sat: Array(totalNumbers).fill(0),
    };

    draws.forEach(draw => {
      const date = this.parseDate(draw.date);
      const dayOfWeek = this.getDayOfWeek(date);
      
      if (dayData[dayOfWeek] && draw.numbers) {
        draw.numbers.split(' ').forEach(num => {
          const number = parseInt(num);
          if (number >= 1 && number <= totalNumbers) {
            dayData[dayOfWeek][number - 1]++;
          }
        });
      }
    });

    const result = {};
    Object.keys(dayData).forEach(day => {
      const dayDraws = draws.filter(draw => {
        const date = this.parseDate(draw.date);
        return this.getDayOfWeek(date) === day;
      });

      result[day] = dayData[day].map((count, index) => ({
        number: index + 1,
        count,
        percentage: dayDraws.length > 0 ? ((count / dayDraws.length) * 100).toFixed(2) : 0,
      }));
    });

    return result;
  }

  static calculateDayOfMonthSummary(draws, totalNumbers) {
    const dayData = {};
    
    // Initialize for days 1-31
    for (let day = 1; day <= 31; day++) {
      dayData[day] = Array(totalNumbers).fill(0);
    }

    draws.forEach(draw => {
      const date = this.parseDate(draw.date);
      const dayOfMonth = date.getDate();
      
      if (dayData[dayOfMonth] && draw.numbers) {
        draw.numbers.split(' ').forEach(num => {
          const number = parseInt(num);
          if (number >= 1 && number <= totalNumbers) {
            dayData[dayOfMonth][number - 1]++;
          }
        });
      }
    });

    const result = {};
    Object.keys(dayData).forEach(day => {
      const dayDraws = draws.filter(draw => {
        const date = this.parseDate(draw.date);
        return date.getDate() === parseInt(day);
      });

      result[day] = dayData[day].map((count, index) => ({
        number: index + 1,
        count,
        percentage: dayDraws.length > 0 ? ((count / dayDraws.length) * 100).toFixed(2) : 0,
      }));
    });

    return result;
  }

  static calculateMonthSummary(draws, totalNumbers) {
    const monthData = {};
    
    // Initialize for months 1-12
    for (let month = 1; month <= 12; month++) {
      monthData[month] = Array(totalNumbers).fill(0);
    }

    draws.forEach(draw => {
      const date = this.parseDate(draw.date);
      const month = date.getMonth() + 1;
      
      if (monthData[month] && draw.numbers) {
        draw.numbers.split(' ').forEach(num => {
          const number = parseInt(num);
          if (number >= 1 && number <= totalNumbers) {
            monthData[month][number - 1]++;
          }
        });
      }
    });

    const result = {};
    Object.keys(monthData).forEach(month => {
      const monthDraws = draws.filter(draw => {
        const date = this.parseDate(draw.date);
        return date.getMonth() + 1 === parseInt(month);
      });

      result[month] = monthData[month].map((count, index) => ({
        number: index + 1,
        count,
        percentage: monthDraws.length > 0 ? ((count / monthDraws.length) * 100).toFixed(2) : 0,
      }));
    });

    return result;
  }

  static calculateEvenOddSummary(draws, totalNumbers) {
    const evenOddData = {
      even: Array(totalNumbers).fill(0),
      odd: Array(totalNumbers).fill(0),
    };

    draws.forEach(draw => {
      const date = this.parseDate(draw.date);
      const isEvenDate = date.getDate() % 2 === 0;
      const type = isEvenDate ? 'even' : 'odd';
      
      if (draw.numbers) {
        draw.numbers.split(' ').forEach(num => {
          const number = parseInt(num);
          if (number >= 1 && number <= totalNumbers) {
            evenOddData[type][number - 1]++;
          }
        });
      }
    });

    const result = {};
    Object.keys(evenOddData).forEach(type => {
      const typeDraws = draws.filter(draw => {
        const date = this.parseDate(draw.date);
        const isEvenDate = date.getDate() % 2 === 0;
        return type === (isEvenDate ? 'even' : 'odd');
      });

      result[type] = evenOddData[type].map((count, index) => ({
        number: index + 1,
        count,
        percentage: typeDraws.length > 0 ? ((count / typeDraws.length) * 100).toFixed(2) : 0,
      }));
    });

    return result;
  }

  static parseDate(dateStr) {
    // Handle format like "T4, 02/07/2025" or just "02/07/2025"
    let datePart = dateStr;
    if (dateStr.includes(', ')) {
      datePart = dateStr.split(', ')[1];
    }
    
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  static getDayOfWeek(date) {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[date.getDay()];
  }

  // Fallback data methods (using bundled data when network fails)
  static getBundledVietlot45Data() {
    // Return sample data structure
    return {
      draws: [
        {
          date: "T7, 15/03/2025",
          numbers: "01 34 39 40 42 45",
          prize: "133.643.776.800"
        }
      ],
      summary: [],
      dayOfWeek: {},
      dayOfMonth: {},
      month: {},
      evenOdd: {},
    };
  }

  static getBundledVietlot55Data() {
    return {
      draws: [
        {
          date: "T7, 15/03/2025", 
          numbers: "01 16 18 30 31 44",
          prize: "115.151.239.200"
        }
      ],
      summary: [],
      dayOfWeek: {},
      dayOfMonth: {},
      month: {},
      evenOdd: {},
    };
  }
} 
