import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart, Receipt, Hash, Scale } from "lucide-react";
import type { CartItem } from "@shared/schema";

interface TransactionCartProps {
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onProcessTransaction?: () => void;
}

export default function TransactionCart({ 
  items, 
  onRemoveItem, 
  onClearCart, 
  onProcessTransaction 
}: TransactionCartProps) {
  const roundCOP = (value: number) => {
    const reminder = value % 100;
    if (reminder === 0) {
      return value;
    } else if (reminder < 50) {
      return value - reminder + 50;
    }
    else if (reminder === 50) {
      return value;
    } else {
      return value -reminder + 100
    }
  }
  let subtotalSum = items.reduce((sum, item) => sum + item.subtotal, 0);
  subtotalSum = roundCOP(subtotalSum)
  const taxSum = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  // console.log("subtotalsum",subtotalSum," tax sum:", taxSum, " total:",total);
  const itemCount = items.length;

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(4)} kg`;
  };

  const formatPrice = (price: number) => {
    const value = parseFloat(price.toString());
    return `$${ value.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits:0 }) }`;
  };

  return (
    <Card className="p-6 h-full flex flex-col" data-testid="card-transaction-cart">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Transacción actual</h3>
        </div>
        <Badge variant="secondary" data-testid="text-item-count">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {/* Total and Actions */}
      {items.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span data-testid="text-cart-subtotal">
                {formatPrice(subtotalSum)}
              </span>
              </div>
              {taxSum > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Impuestos:</span>
                    <span data-testid="text-cart-tax">
                  {formatPrice(taxSum)}
                </span>
                  </div>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-cart-total">
                {formatPrice(total)}
              </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                  variant="outline"
                  onClick={onClearCart}
                  data-testid="button-clear-cart"
              >
                Limpiar Carrito
              </Button>
              <Button
                  onClick={onProcessTransaction}
                  className="flex items-center gap-2"
                  data-testid="button-process-transaction"
              >
                <Receipt className="w-4 h-4" />
                Facturar
              </Button>
            </div>
          </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 space-y-3 min-h-0 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8" data-testid="text-empty-cart">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay productos en el carrito</p>
            <p className="text-sm">Seleccione los productos para agregarlos</p>
          </div>
        ) : (
          items.map((item, index) => (
            <Card key={index} className="p-3 space-y-3" data-testid={`card-cart-item-${index}`}>
              {/* Header with product info and remove button */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      <Hash className="w-2 h-2 mr-1" />
                      {item.productCode}
                    </Badge>
                    {item.taxRate > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.taxRate}% IVA
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-sm truncate" data-testid={`text-item-name-${index}`}>
                    {item.productName}
                  </h4>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onRemoveItem(index)}
                  data-testid={`button-remove-item-${index}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {/* Weight and unit price */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Scale className="w-3 h-3" />
                  <span data-testid={`text-item-weight-${index}`}>
                    {formatWeight(item.weight)}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  @ {formatPrice(item.pricePerUnit)} por {item.unit}
                </span>
              </div>

              {/* Price breakdown */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span data-testid={`text-item-subtotal-${index}`}>
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
                {item.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IVA ({item.taxRate}%):</span>
                    <span data-testid={`text-item-tax-${index}`}>
                      {formatPrice(item.taxAmount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary" data-testid={`text-item-total-${index}`}>
                    {formatPrice(item.total)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}