import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, ExternalLink, CheckCircle } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  hasApiKey: boolean;
}

export const ApiKeyInput = ({ onApiKeySet, hasApiKey }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [showInput, setShowInput] = useState(!hasApiKey);

  const handleSubmit = () => {
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setShowInput(false);
    }
  };

  if (hasApiKey && !showInput) {
    return (
      <Card className="p-4 mb-6 bg-success/10 border-success/30">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <div className="flex-1">
            <h3 className="font-medium text-foreground">API Connected</h3>
            <p className="text-sm text-muted-foreground">Showing live NSE stock prices</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowInput(true)}
            className="text-xs"
          >
            Change API Key
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-6 bg-warning/5 border-warning/30">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Key className="w-5 h-5 text-warning" />
          <div>
            <h3 className="font-semibold text-foreground">Alpha Vantage API Key Required</h3>
            <p className="text-sm text-muted-foreground">Enter your API key to get real-time NSE stock prices</p>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <strong>Get your FREE API key:</strong>
            <br />
            1. Visit Alpha Vantage and sign up for free account
            <br />
            2. Get your API key from dashboard  
            <br />
            3. Enter it below to activate live data
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Enter your Alpha Vantage API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button onClick={handleSubmit} disabled={!apiKey.trim()}>
            Connect
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a 
              href="https://www.alphavantage.co/support/#api-key" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Get Free API Key
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Your API key is stored securely in your browser session only. We never store or share your API keys.
        </p>
      </div>
    </Card>
  );
};