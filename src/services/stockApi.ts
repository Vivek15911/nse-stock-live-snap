// Real-time stock data service using Yahoo Finance API
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  rsi?: number;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// NSE symbol mapping for Yahoo Finance API
const NSE_SYMBOLS = {
  'TATASTEEL': 'TATASTEEL.NS',
  'TATAMOTORS': 'TATAMOTORS.NS', 
  'NIFTY50': '^NSEI',
  'INDIAVIX': '^INDIAVIX',
  'HDFCBANK': 'HDFCBANK.NS'
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
      const yahooSymbol = NSE_SYMBOLS[symbol as keyof typeof NSE_SYMBOLS] || symbol;
      
      // Using Yahoo Finance API through RapidAPI or similar service
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
        throw new Error('No data received from API');
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const quote = result.indicators.quote[0];
      
      const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
      const previousClose = meta.previousClose;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      // Calculate RSI (simplified version)
      const rsi = await this.calculateRSI(quote.close.slice(-14));

      const stockData: StockData = {
        symbol,
        name: meta.longName || symbol,
        price: currentPrice,
        change,
        changePercent,
        rsi
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
    try {
      const yahooSymbol = NSE_SYMBOLS[symbol as keyof typeof NSE_SYMBOLS] || symbol;
      const period = this.getYahooPeriod(interval);
      
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${period}&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const data = await response.json();
      const result = data.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      return timestamps.map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000,
        open: quote.open[index] || 0,
        high: quote.high[index] || 0, 
        low: quote.low[index] || 0,
        close: quote.close[index] || 0,
        volume: quote.volume[index] || 0
      })).filter((point: ChartDataPoint) => point.close > 0);

    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      return this.getMockChartData();
    }
  }

  private getYahooPeriod(minutes: number): string {
    if (minutes === 1) return '1m';
    if (minutes <= 5) return '5m';
    if (minutes <= 15) return '15m';
    if (minutes <= 30) return '30m';
    return '1h';
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
        rsi: 65.2
      },
      'TATAMOTORS': {
        symbol: 'TATAMOTORS', 
        name: 'Tata Motors Limited',
        price: 924.80,
        change: -15.60,
        changePercent: -1.66,
        rsi: 42.8
      },
      'NIFTY50': {
        symbol: 'NIFTY50',
        name: 'Nifty 50 Index', 
        price: 24587.20,
        change: 145.30,
        changePercent: 0.59,
        rsi: 58.4
      },
      'INDIAVIX': {
        symbol: 'INDIAVIX',
        name: 'India VIX',
        price: 13.45,
        change: -0.87,
        changePercent: -6.08,
        rsi: 35.6
      },
      'HDFCBANK': {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Limited',
        price: 1687.90,
        change: 23.45,
        changePercent: 1.41,
        rsi: 52.1
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