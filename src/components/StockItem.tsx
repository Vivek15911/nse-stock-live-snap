import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockChart } from "./StockChart";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { stockApi, type StockData } from "@/services/stockApi";

interface StockItemProps {
  initialStock: StockData;
}

export const StockItem = ({ initialStock }: StockItemProps) => {
  const [selectedInterval, setSelectedInterval] = useState<number | null>(null);
  const [stockData, setStockData] = useState<StockData>(initialStock);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch real-time stock data
  const fetchStockData = async () => {
    setLoading(true);
    try {
      const data = await stockApi.getStockData(initialStock.symbol);
      setStockData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(`Error fetching ${initialStock.symbol}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchStockData();
    
    const interval = setInterval(() => {
      fetchStockData();
    }, 30000);

    return () => clearInterval(interval);
  }, [initialStock.symbol]);

  const intervals = [1, 10, 15, 20];
  const isPositive = stockData.change >= 0;

  return (
    <Card className="p-4 mb-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{stockData.symbol}</h3>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger" />
            )}
            <Button
              variant="ghost"
              size="sm" 
              onClick={fetchStockData}
              disabled={loading}
              className="ml-2 h-6 w-6 p-0"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{stockData.name}</p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            ₹{stockData.price.toFixed(2)}
          </div>
          <div className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? '+' : ''}₹{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="ml-6 text-right">
          <div className="text-xs text-muted-foreground mb-1">RSI</div>
          <div className={`text-lg font-bold ${
            (stockData.rsi || 0) > 70 ? 'text-danger' : 
            (stockData.rsi || 0) < 30 ? 'text-success' : 'text-warning'
          }`}>
            {stockData.rsi?.toFixed(1) || 'N/A'}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        {intervals.map((interval) => (
          <Button
            key={interval}
            variant={selectedInterval === interval ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedInterval(selectedInterval === interval ? null : interval)}
            className="text-xs"
          >
            {interval}m
          </Button>
        ))}
      </div>
      
      {selectedInterval && (
        <div className="mt-4">
          <StockChart 
            symbol={stockData.symbol} 
            interval={selectedInterval}
            currentPrice={stockData.price}
          />
        </div>
      )}
    </Card>
  );
};