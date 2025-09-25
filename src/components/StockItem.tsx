import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockChart } from "./StockChart";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  rsi: number;
}

interface StockItemProps {
  stock: StockData;
}

export const StockItem = ({ stock }: StockItemProps) => {
  const [selectedInterval, setSelectedInterval] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState(stock.price);
  const [currentChange, setCurrentChange] = useState(stock.change);
  const [currentRSI, setCurrentRSI] = useState(stock.rsi);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const priceVariation = (Math.random() - 0.5) * 2; // Random change between -1 and 1
      const newPrice = Math.max(0, currentPrice + priceVariation);
      const newChange = newPrice - stock.price;
      const newRSI = Math.min(100, Math.max(0, currentRSI + (Math.random() - 0.5) * 4));
      
      setCurrentPrice(newPrice);
      setCurrentChange(newChange);
      setCurrentRSI(newRSI);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPrice, stock.price, currentRSI]);

  const intervals = [1, 10, 15, 20];
  const isPositive = currentChange >= 0;
  const changePercent = (currentChange / stock.price) * 100;

  return (
    <Card className="p-4 mb-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{stock.symbol}</h3>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{stock.name}</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            ₹{currentPrice.toFixed(2)}
          </div>
          <div className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? '+' : ''}₹{currentChange.toFixed(2)} ({changePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="ml-6 text-right">
          <div className="text-xs text-muted-foreground mb-1">RSI</div>
          <div className={`text-lg font-bold ${
            currentRSI > 70 ? 'text-danger' : 
            currentRSI < 30 ? 'text-success' : 'text-warning'
          }`}>
            {currentRSI.toFixed(1)}
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
            symbol={stock.symbol} 
            interval={selectedInterval}
            currentPrice={currentPrice}
          />
        </div>
      )}
    </Card>
  );
};