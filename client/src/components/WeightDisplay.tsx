import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WeightDisplayProps {
  onWeightChange?: (weight: number) => void;
  unit?: "kg" | "g";
}

export default function WeightDisplay({ onWeightChange, unit = "kg" }: WeightDisplayProps) {
  const [weight, setWeight] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [manualWeight, setManualWeight] = useState("");
  const [serialPort, setSerialPort] = useState<any>(null);

  // Simulate weight readings when connected
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        // Simulate small weight fluctuations
        const baseWeight = 1.234;
        const fluctuation = (Math.random() - 0.5) * 0.01;
        const newWeight = baseWeight + fluctuation;
        setWeight(newWeight);
        onWeightChange?.(newWeight);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isConnected, onWeightChange]);

  const connectToScale = async () => {
    if (!("serial" in navigator)) {
      alert("Web Serial API not supported in this browser");
      return;
    }

    try {
      setIsConnecting(true);
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      setSerialPort(port);
      setIsConnected(true);
      console.log("Connected to scale");
    } catch (error) {
      console.error("Failed to connect to scale:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectScale = async () => {
    if (serialPort) {
      await serialPort.close();
      setSerialPort(null);
    }
    setIsConnected(false);
    setWeight(0);
  };

  const tareScale = () => {
    setWeight(0);
    onWeightChange?.(0);
    console.log("Scale tared");
  };

  const useManualWeight = () => {
    const value = parseFloat(manualWeight);
    if (!isNaN(value) && value >= 0) {
      setWeight(value);
      onWeightChange?.(value);
      setManualWeight("");
    }
  };

  return (
    <Card className="p-6 space-y-6" data-testid="card-weight-display">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Digital Scale</h3>
        </div>
        <Badge 
          variant={isConnected ? "default" : "secondary"}
          className="flex items-center gap-1"
        >
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {/* Weight Display */}
      <div className="text-center space-y-2">
        <div className="text-6xl font-display font-bold text-primary" data-testid="text-current-weight">
          {weight.toFixed(3)}
        </div>
        <div className="text-lg text-muted-foreground">{unit}</div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {!isConnected ? (
          <Button 
            onClick={connectToScale} 
            disabled={isConnecting}
            size="lg"
            className="col-span-2"
            data-testid="button-connect-scale"
          >
            {isConnecting ? "Connecting..." : "Connect to Scale"}
          </Button>
        ) : (
          <>
            <Button 
              onClick={tareScale} 
              variant="outline" 
              size="lg"
              data-testid="button-tare-scale"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Tare
            </Button>
            <Button 
              onClick={disconnectScale} 
              variant="outline" 
              size="lg"
              data-testid="button-disconnect-scale"
            >
              Disconnect
            </Button>
          </>
        )}
      </div>

      {/* Manual Weight Override */}
      <div className="space-y-3 pt-4 border-t">
        <Label htmlFor="manual-weight" className="text-sm font-medium">
          Manual Weight Entry
        </Label>
        <div className="flex gap-2">
          <Input
            id="manual-weight"
            type="number"
            placeholder="0.000"
            value={manualWeight}
            onChange={(e) => setManualWeight(e.target.value)}
            step="0.001"
            min="0"
            data-testid="input-manual-weight"
          />
          <Button 
            onClick={useManualWeight}
            disabled={!manualWeight}
            data-testid="button-use-manual-weight"
          >
            Use
          </Button>
        </div>
      </div>
    </Card>
  );
}