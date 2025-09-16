import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calculator, Check, X } from "lucide-react";
import type { CartItem } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (amountReceived: number, change: number) => void;
  total: number;
  items: CartItem[];
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  total, 
  items 
}: PaymentModalProps) {
  const [amountReceived, setAmountReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const receivedAmount = parseFloat(amountReceived) || 0;
  const change = receivedAmount - total;
  const isValidPayment = receivedAmount >= total;

  const handleNumberPad = (digit: string) => {
    if (digit === ".") {
      if (!amountReceived.includes(".")) {
        setAmountReceived(prev => prev + digit);
      }
    } else {
      setAmountReceived(prev => prev + digit);
    }
  };

  const handleClear = () => {
    setAmountReceived("");
  };

  const handleBackspace = () => {
    setAmountReceived(prev => prev.slice(0, -1));
  };

  const handleComplete = async () => {
    if (!isValidPayment) return;
    
    setIsProcessing(true);
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete(receivedAmount, change);
    setIsProcessing(false);
    setAmountReceived("");
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const quickAmounts = [
    total, // Exact amount
    Math.ceil(total), // Round up to nearest dollar
    Math.ceil(total / 5) * 5, // Round up to nearest $5
    Math.ceil(total / 10) * 10, // Round up to nearest $10
  ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Remove duplicates

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-payment">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Transaction Summary */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transaction Summary</Label>
              <div className="space-y-1 text-sm">
                {items.map((item, index) => (
                  <div key={index} className="flex justify-between" data-testid={`text-summary-item-${index}`}>
                    <span className="truncate">
                      {item.productName} ({item.weight.toFixed(3)} {item.unit})
                    </span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary" data-testid="text-payment-total">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex justify-between text-lg">
                <span>Amount Received:</span>
                <span data-testid="text-amount-received">
                  {formatPrice(receivedAmount)}
                </span>
              </div>

              <div className={`flex justify-between text-lg font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Change:</span>
                <span data-testid="text-change-amount">
                  {formatPrice(Math.max(0, change))}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Payment Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount-received">Amount Received</Label>
              <Input
                id="amount-received"
                type="number"
                placeholder="0.00"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="text-xl text-center"
                step="0.01"
                min="0"
                data-testid="input-amount-received"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label className="text-sm">Quick Amounts</Label>
              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => setAmountReceived(amount.toString())}
                    data-testid={`button-quick-amount-${amount}`}
                  >
                    {formatPrice(amount)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Number Pad */}
            <div className="space-y-2">
              <Label className="text-sm">Number Pad</Label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    onClick={() => handleNumberPad(num.toString())}
                    className="h-12"
                    data-testid={`button-numpad-${num}`}
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handleNumberPad(".")}
                  className="h-12"
                  data-testid="button-numpad-decimal"
                >
                  .
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleNumberPad("0")}
                  className="h-12"
                  data-testid="button-numpad-0"
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackspace}
                  className="h-12"
                  data-testid="button-numpad-backspace"
                >
                  ⌫
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full"
                data-testid="button-clear-amount"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-payment"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button 
            onClick={handleComplete}
            disabled={!isValidPayment || isProcessing}
            className="flex items-center gap-2"
            data-testid="button-complete-payment"
          >
            <Check className="w-4 h-4" />
            {isProcessing ? "Processing..." : "Complete Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}