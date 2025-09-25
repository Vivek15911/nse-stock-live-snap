import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { stockApi, type ChartDataPoint } from '@/services/stockApi';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const chartPoints = await stockApi.getChartData(symbol, interval);
        
        const formattedData = chartPoints.map(point => ({
          time: new Date(point.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          price: point.close,
          volume: point.volume
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Fallback to empty data
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
    
    // Refresh chart data every minute for real-time updates
    const updateInterval = setInterval(fetchChartData, 60000);
    return () => clearInterval(updateInterval);
  }, [symbol, interval]);

  const formatPrice = (value: number) => `₹${value.toFixed(2)}`;

  if (loading) {
    return (
      <div className="h-80 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <div className="mb-2">
        <h4 className="text-sm font-medium text-foreground">
          {symbol} - {interval} Minute Chart (Real-time NSE Data)
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