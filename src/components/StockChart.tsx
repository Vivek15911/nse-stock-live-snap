import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface StockChartProps {
  symbol: string;
  interval: number;
  currentPrice: number;
}

interface ChartData {
  time: string;
  price: number;
  volume: number;
}

export const StockChart = ({ symbol, interval, currentPrice }: StockChartProps) => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Generate mock historical data
    const generateData = () => {
      const points = 50;
      const newData: ChartData[] = [];
      let basePrice = currentPrice;
      
      for (let i = points; i >= 0; i--) {
        const variation = (Math.random() - 0.5) * 5;
        basePrice += variation;
        basePrice = Math.max(0, basePrice);
        
        const date = new Date();
        date.setMinutes(date.getMinutes() - i * interval);
        
        newData.push({
          time: date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: basePrice,
          volume: Math.floor(Math.random() * 100000) + 10000
        });
      }
      
      return newData;
    };

    setData(generateData());
    
    // Update chart data periodically
    const updateInterval = setInterval(() => {
      setData(prev => {
        const newData = [...prev];
        newData.shift(); // Remove oldest point
        
        const lastPrice = newData[newData.length - 1]?.price || currentPrice;
        const variation = (Math.random() - 0.5) * 2;
        const newPrice = Math.max(0, lastPrice + variation);
        
        const now = new Date();
        newData.push({
          time: now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: newPrice,
          volume: Math.floor(Math.random() * 100000) + 10000
        });
        
        return newData;
      });
    }, interval * 1000);

    return () => clearInterval(updateInterval);
  }, [symbol, interval, currentPrice]);

  const formatPrice = (value: number) => `₹${value.toFixed(2)}`;

  return (
    <div className="h-80 w-full">
      <div className="mb-2">
        <h4 className="text-sm font-medium text-foreground">
          {symbol} - {interval} Minute Chart
        </h4>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            tickFormatter={formatPrice}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: any) => [formatPrice(value), 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};