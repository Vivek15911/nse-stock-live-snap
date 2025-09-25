import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockChart } from "./StockChart";
import { TrendingUp, TrendingDown } from "lucide-react";
import { stockApi, type StockData } from "@/services/stockApi";

interface StockItemProps {
  initialStock: StockData;
  onRefresh?: () => void;
}

export const StockItem = ({ initialStock, onRefresh }: StockItemProps) => {
  const [selectedInterval, setSelectedInterval] = useState<number | null>(null);
  const [stockData, setStockData] = useState<StockData>(initialStock);

  useEffect(() => {
    setStockData(initialStock);
  }, [initialStock]);

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
          </div>
          <p className="text-sm text-muted-foreground">{stockData.name}</p>
          <p className="text-xs text-muted-foreground">
            Last updated: {stockData.lastUpdated}
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