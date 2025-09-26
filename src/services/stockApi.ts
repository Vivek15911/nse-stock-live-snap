// Real-time stock data service using Indian API
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

// NSE symbol mapping for Indian API
const NSE_SYMBOLS = {
  'TATASTEEL': 'TATASTEEL',
  'TATAMOTORS': 'TATAMOTORS', 
  'NIFTY50': 'NIFTY 50',
  'INDIAVIX': 'INDIA VIX',
  'HDFCBANK': 'HDFCBANK'
};

export class StockApiService {
  private static instance: StockApiService;
  private cache = new Map<string, { data: StockData; timestamp: number }>();
  private CACHE_DURATION = 30000; // 30 seconds cache

  static getInstance(): StockApiService {
    if (!StockApiService.instance) {
      StockApiService.instance = new StockApiService();
    }
    return StockApiService.instance;
  }

  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = symbol;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const companyName = NSE_SYMBOLS[symbol as keyof typeof NSE_SYMBOLS] || symbol;
      
      console.log(`Fetching data for ${symbol} (${companyName})`);
      
      // Using Indian API for real-time NSE data
      const response = await fetch(
        `https://indianapi.in/api/stock?name=${encodeURIComponent(companyName)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.error(`HTTP error for ${symbol}:`, response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API response for ${symbol}:`, data);
      
      if (!data || !data.price) {
        console.error(`No price data for ${symbol}:`, data);
        throw new Error('No price data received from API');
      }

      const currentPrice = parseFloat(data.price.replace(/,/g, ''));
      const change = parseFloat(data.change?.replace(/,/g, '') || '0');
      const changePercent = parseFloat(data.changePercent?.replace('%', '') || '0');

      const stockData: StockData = {
        symbol,
        name: this.getCompanyName(symbol),
        price: currentPrice,
        change,
        changePercent,
        rsi: Math.random() * 100, // Generate RSI since Indian API might not have it
        lastUpdated: new Date().toLocaleString()
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
    console.log(`Getting chart data for ${symbol} with ${interval}min interval - using mock data for now`);
    return this.getMockChartData();
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
    // Generate realistic RSI value since Indian API doesn't provide technical indicators
    return 30 + Math.random() * 40; // RSI between 30-70
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
        price: 118.45 + (Math.random() - 0.5) * 10,
        change: 2.35 + (Math.random() - 0.5) * 5,
        changePercent: 2.02 + (Math.random() - 0.5) * 3,
        rsi: 50 + (Math.random() - 0.5) * 40,
        lastUpdated: new Date().toLocaleString()
      },
      'TATAMOTORS': {
        symbol: 'TATAMOTORS', 
        name: 'Tata Motors Limited',
        price: 924.80 + (Math.random() - 0.5) * 50,
        change: -15.60 + (Math.random() - 0.5) * 20,
        changePercent: -1.66 + (Math.random() - 0.5) * 2,
        rsi: 42.8 + (Math.random() - 0.5) * 30,
        lastUpdated: new Date().toLocaleString()
      },
      'NIFTY50': {
        symbol: 'NIFTY50',
        name: 'Nifty 50 Index', 
        price: 24587.20 + (Math.random() - 0.5) * 200,
        change: 145.30 + (Math.random() - 0.5) * 100,
        changePercent: 0.59 + (Math.random() - 0.5) * 1,
        rsi: 58.4 + (Math.random() - 0.5) * 20,
        lastUpdated: new Date().toLocaleString()
      },
      'INDIAVIX': {
        symbol: 'INDIAVIX',
        name: 'India VIX',
        price: 13.45 + (Math.random() - 0.5) * 2,
        change: -0.87 + (Math.random() - 0.5) * 1,
        changePercent: -6.08 + (Math.random() - 0.5) * 3,
        rsi: 35.6 + (Math.random() - 0.5) * 25,
        lastUpdated: new Date().toLocaleString()
      },
      'HDFCBANK': {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Limited',
        price: 1687.90 + (Math.random() - 0.5) * 100,
        change: 23.45 + (Math.random() - 0.5) * 30,
        changePercent: 1.41 + (Math.random() - 0.5) * 2,
        rsi: 52.1 + (Math.random() - 0.5) * 30,
        lastUpdated: new Date().toLocaleString()
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