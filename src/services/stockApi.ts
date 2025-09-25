// Real-time stock data service using Alpha Vantage API
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  rsi?: number;
  lastUpdated: string;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// NSE symbol mapping for Alpha Vantage API
const NSE_SYMBOLS = {
  'TATASTEEL': 'TATASTEEL.BSE',
  'TATAMOTORS': 'TATAMOTORS.BSE', 
  'NIFTY50': 'NIFTY50.BSE',
  'INDIAVIX': 'INDIAVIX.BSE',
  'HDFCBANK': 'HDFCBANK.BSE'
};

export class StockApiService {
  private static instance: StockApiService;
  private cache = new Map<string, { data: StockData; timestamp: number }>();
  private CACHE_DURATION = 30000; // 30 seconds cache
  private apiKey: string | null = null;

  static getInstance(): StockApiService {
    if (!StockApiService.instance) {
      StockApiService.instance = new StockApiService();
    }
    return StockApiService.instance;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async getStockData(symbol: string): Promise<StockData> {
    if (!this.apiKey) {
      return this.getMockData(symbol);
    }

    const cacheKey = symbol;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const alphaVantageSymbol = NSE_SYMBOLS[symbol as keyof typeof NSE_SYMBOLS] || symbol;
      
      // Using Alpha Vantage API for real-time data
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaVantageSymbol}&apikey=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['Error Message'] || !data['Global Quote']) {
        throw new Error(data['Error Message'] || 'No data received from API');
      }

      const quote = data['Global Quote'];
      const currentPrice = parseFloat(quote['05. price']);
      const previousClose = parseFloat(quote['08. previous close']);
      const change = currentPrice - previousClose;
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

      // Get historical data for RSI calculation
      const rsi = await this.calculateRSIFromAPI(alphaVantageSymbol);

      const stockData: StockData = {
        symbol,
        name: this.getCompanyName(symbol),
        price: currentPrice,
        change,
        changePercent,
        rsi,
        lastUpdated: quote['07. latest trading day']
      };

      this.cache.set(cacheKey, { data: stockData, timestamp: Date.now() });
      return stockData;

    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      // Fallback to mock data if API fails
      return this.getMockData(symbol);
    }
  }

  async getChartData(symbol: string, interval: number): Promise<ChartDataPoint[]> {
    if (!this.apiKey) {
      return this.getMockChartData();
    }

    try {
      const alphaVantageSymbol = NSE_SYMBOLS[symbol as keyof typeof NSE_SYMBOLS] || symbol;
      const intervalStr = this.getAlphaVantageInterval(interval);
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${alphaVantageSymbol}&interval=${intervalStr}&apikey=${this.apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      const timeSeries = data[`Time Series (${intervalStr})`];
      
      if (!timeSeries) {
        throw new Error('No time series data available');
      }

      const chartData: ChartDataPoint[] = [];
      const timestamps = Object.keys(timeSeries).sort();

      for (const timestamp of timestamps.slice(-50)) { // Last 50 points
        const point = timeSeries[timestamp];
        chartData.push({
          timestamp: new Date(timestamp).getTime(),
          open: parseFloat(point['1. open']),
          high: parseFloat(point['2. high']),
          low: parseFloat(point['3. low']),
          close: parseFloat(point['4. close']),
          volume: parseInt(point['5. volume'])
        });
      }

      return chartData;

    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return this.getMockChartData();
    }
  }

  private getAlphaVantageInterval(minutes: number): string {
    if (minutes === 1) return '1min';
    if (minutes <= 5) return '5min';
    if (minutes <= 15) return '15min';
    if (minutes <= 30) return '30min';
    return '60min';
  }

  private getCompanyName(symbol: string): string {
    const names = {
      'TATASTEEL': 'Tata Steel Limited',
      'TATAMOTORS': 'Tata Motors Limited',
      'NIFTY50': 'Nifty 50 Index',
      'INDIAVIX': 'India VIX',
      'HDFCBANK': 'HDFC Bank Limited'
    };
    return names[symbol as keyof typeof names] || symbol;
  }

  private async calculateRSIFromAPI(symbol: string): Promise<number> {
    if (!this.apiKey) return 50;
    
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${this.apiKey}`
      );
      
      const data = await response.json();
      const technicalAnalysis = data['Technical Analysis: RSI'];
      
      if (!technicalAnalysis) return 50;
      
      const latestDate = Object.keys(technicalAnalysis)[0];
      return parseFloat(technicalAnalysis[latestDate]['RSI']);
    } catch (error) {
      console.error('Error calculating RSI:', error);
      return 50;
    }
  }

  private async calculateRSI(prices: number[]): Promise<number> {
    if (prices.length < 14) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }

    const avgGain = gains / (prices.length - 1);
    const avgLoss = losses / (prices.length - 1);

    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private getMockData(symbol: string): StockData {
    const mockPrices: { [key: string]: StockData } = {
      'TATASTEEL': {
        symbol: 'TATASTEEL',
        name: 'Tata Steel Limited',
        price: 118.45,
        change: 2.35,
        changePercent: 2.02,
        rsi: 65.2,
        lastUpdated: 'API Key Required'
      },
      'TATAMOTORS': {
        symbol: 'TATAMOTORS', 
        name: 'Tata Motors Limited',
        price: 924.80,
        change: -15.60,
        changePercent: -1.66,
        rsi: 42.8,
        lastUpdated: 'API Key Required'
      },
      'NIFTY50': {
        symbol: 'NIFTY50',
        name: 'Nifty 50 Index', 
        price: 24587.20,
        change: 145.30,
        changePercent: 0.59,
        rsi: 58.4,
        lastUpdated: 'API Key Required'
      },
      'INDIAVIX': {
        symbol: 'INDIAVIX',
        name: 'India VIX',
        price: 13.45,
        change: -0.87,
        changePercent: -6.08,
        rsi: 35.6,
        lastUpdated: 'API Key Required'
      },
      'HDFCBANK': {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Limited',
        price: 1687.90,
        change: 23.45,
        changePercent: 1.41,
        rsi: 52.1,
        lastUpdated: 'API Key Required'
      }
    };

    return mockPrices[symbol] || mockPrices['TATASTEEL'];
  }

  private getMockChartData(): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const basePrice = 1000;
    const now = Date.now();
    
    for (let i = 50; i >= 0; i--) {
      const timestamp = now - (i * 60000); // 1 minute intervals
      const price = basePrice + (Math.random() - 0.5) * 20;
      data.push({
        timestamp,
        open: price,
        high: price + Math.random() * 5,
        low: price - Math.random() * 5,
        close: price,
        volume: Math.floor(Math.random() * 100000)
      });
    }
    
    return data;
  }
}

export const stockApi = StockApiService.getInstance();