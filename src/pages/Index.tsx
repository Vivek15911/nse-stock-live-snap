import { StockItem } from "@/components/StockItem";
import { useEffect, useState } from "react";
import { stockApi, type StockData } from "@/services/stockApi";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle } from "lucide-react";

const initialStocks = [
  { symbol: "TATASTEEL", name: "Tata Steel Limited" },
  { symbol: "TATAMOTORS", name: "Tata Motors Limited" },
  { symbol: "NIFTY50", name: "Nifty 50 Index" },
  { symbol: "INDIAVIX", name: "India VIX" },
  { symbol: "HDFCBANK", name: "HDFC Bank Limited" }
];

const Index = () => {
  const [stocksData, setStocksData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllStocks = async () => {
    setLoading(true);
    try {
      const stockPromises = initialStocks.map(stock => 
        stockApi.getStockData(stock.symbol)
      );
      const results = await Promise.all(stockPromises);
      setStocksData(results);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySet = (apiKey: string) => {
    // No longer needed - using free Indian API
    setHasApiKey(true);
    fetchAllStocks();
  };

  const handleRefreshAll = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const stockPromises = initialStocks.map(stock => 
        stockApi.getStockData(stock.symbol)
      );
      const results = await Promise.all(stockPromises);
      setStocksData(results);
    } catch (error) {
      console.error('Error refreshing stocks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // No API key needed for Indian API - just fetch data
    setHasApiKey(true);
    fetchAllStocks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading NSE Stock Data</h2>
          <p className="text-muted-foreground">Fetching real-time prices and RSI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                NSE STOCK EXCHANGE
              </h1>
              <p className="text-muted-foreground mt-1">
                Live Market Data & Real-time Trading Information
              </p>
            </div>
            <Button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <h3 className="font-medium text-foreground">Live NSE Data Active</h3>
                <p className="text-sm text-muted-foreground">Real-time NSE stock prices updated every 30 seconds</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          {stocksData.map((stock) => (
            <StockItem 
              key={stock.symbol} 
              initialStock={stock} 
              onRefresh={handleRefreshAll}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-muted-foreground text-sm">
            Real-time NSE market data powered by Alpha Vantage API.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;