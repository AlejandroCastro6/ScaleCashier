import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Plug2, Unplug, RotateCcw } from "lucide-react";
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
  // useEffect(() => {
  //   if (isConnected) {
  //     const interval = setInterval(() => {
  //       // Simulate small weight fluctuations
  //       const baseWeight = 1.234;
  //       const fluctuation = (Math.random() - 0.5) * 0.01;
  //       const newWeight = baseWeight + fluctuation;
  //       setWeight(newWeight);
  //       onWeightChange?.(newWeight);
  //     }, 500);
  //
  //     return () => clearInterval(interval);
  //   }
  // }, [isConnected, onWeightChange]);
  const connectToScale = async () => {
    if (!("serial" in navigator)) {
      alert("Web Serial API not supported in this browser");
      return;
    }
    try {
      setIsConnecting(true);
      const port = await (navigator as any).serial.requestPort();
    console.log(port.getInfo());
      await port.open({ baudRate: 9600 });
      setSerialPort(port);  // only open and save
      setIsConnected(true);
      console.log("Connected to scale");
    } catch (error) {
      console.error("Failed to connect to scale:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!serialPort) return;

    const reader = serialPort.readable.getReader();
    const decoder = new TextDecoder();
    let cancelled = false;

    const readLoop = async () => {
      try {
        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) {
            console.log("Port close by device");
            break;
          }
          if (value) {
            const raw = decoder.decode(value);
            // console.log("Raw data from scale:", raw);

            // Example parsing: extract first number
            const match = raw.match(/([0-9]*\.?[0-9]+)/);
            if (match) {
              const parsed = parseFloat(match[1]);
              setWeight(parsed);
              onWeightChange?.(parsed);
            }
          }
        }
      } catch (err) {
        console.error("Error reading from scale:", err);
      } finally {
        reader.releaseLock();
      }
    };
    readLoop();
    return () => {
      cancelled = true;
      reader.releaseLock();
    };
  }, [serialPort, onWeightChange]);

  const disconnectScale = async () => {
    if (serialPort) {
    console.log(serialPort, " el puero pue")
      try{
      await serialPort.close();
        console.log("Scale disconnected");
      }catch (e) {
        console.error("Error disconnecting scale:", e);
      }
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
          <Scale className="w-5 h-5 text-primary"/>
          <h3 className="text-lg font-semibold">Balanza digital</h3>
        </div>
        <Badge
          variant={ isConnected ? "default" : "secondary" }
          className="flex items-center gap-1"
        >
          { isConnected ? <Plug2 className="w-3 h-3"/> : <Unplug className="w-3 h-3"/> }
          { isConnected ? "Conectada" : "Desconectada" }
        </Badge>
      </div>

      {/* Weight Display */ }
      <div className="text-center space-y-2">
        <div className="text-6xl font-display font-bold text-primary" data-testid="text-current-weight">
          { weight.toFixed(4) }
        </div>
        <div className="text-lg text-muted-foreground">{ unit }</div>
      </div>

      {/* Control Buttons */ }
      <div className="grid grid-cols-2 gap-3">
        { !isConnected ? (
          <Button
            onClick={ connectToScale }
            disabled={ isConnecting }
            size="lg"
            className="col-span-2"
            data-testid="button-connect-scale"
          >
            { isConnecting ? "Conectando..." : "Conectar la balanza" }
          </Button>
        ) : (
          <>
            <Button
              onClick={ tareScale }
              variant="outline"
              size="lg"
              data-testid="button-tare-scale"
            >
              <RotateCcw className="w-4 h-4 mr-2"/>
              Tare
            </Button>
            <Button
              onClick={ disconnectScale }
              variant="outline"
              size="lg"
              data-testid="button-disconnect-scale"
            >
              Desconectar
            </Button>
          </>
        ) }
      </div>

      {/* Manual Weight Override */ }
      <div className="space-y-3 pt-4 border-t">
        <Label htmlFor="manual-weight" className="text-sm font-medium">
          Entrada de peso manual
        </Label>
        <div className="flex gap-2">
          <Input
            id="manual-weight"
            type="number"
            placeholder="0.0000"
            value={ manualWeight }
            onChange={ (e) => setManualWeight(e.target.value) }
            step="0.0001"
            min="0"
            data-testid="input-manual-weight"
          />
          <Button
            onClick={ useManualWeight }
            disabled={ !manualWeight }
            data-testid="button-use-manual-weight"
          >
            Asignar
          </Button>
        </div>
      </div>
    </Card>
  );
}