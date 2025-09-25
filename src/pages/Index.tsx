import { StockItem } from "@/components/StockItem";

const stocksData = [
  {
    symbol: "TATASTEEL",
    name: "Tata Steel Limited",
    price: 118.45,
    change: 2.35,
    changePercent: 2.02,
    rsi: 65.2
  },
  {
    symbol: "TATAMOTORS",
    name: "Tata Motors Limited",
    price: 924.80,
    change: -15.60,
    changePercent: -1.66,
    rsi: 42.8
  },
  {
    symbol: "NIFTY50",
    name: "Nifty 50 Index",
    price: 24587.20,
    change: 145.30,
    changePercent: 0.59,
    rsi: 58.4
  },
  {
    symbol: "INDIAVIX",
    name: "India VIX",
    price: 13.45,
    change: -0.87,
    changePercent: -6.08,
    rsi: 35.6
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Limited",
    price: 1687.90,
    change: 23.45,
    changePercent: 1.41,
    rsi: 52.1
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            NSE STOCK EXCHANGE
          </h1>
          <p className="text-muted-foreground mt-1">
            Live Market Data & Real-time Trading Information
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-1">
          {stocksData.map((stock) => (
            <StockItem key={stock.symbol} stock={stock} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-muted-foreground text-sm">
            Market data provided for educational purposes. Real-time updates simulated.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;