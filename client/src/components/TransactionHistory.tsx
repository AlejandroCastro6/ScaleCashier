import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { History, Receipt, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Transaction, TransactionItem } from "@shared/schema";

interface TransactionWithItems extends Transaction {
  items: TransactionItem[];
}

interface TransactionHistoryProps {
  transactions: TransactionWithItems[];
  onViewReceipt?: (transaction: TransactionWithItems) => void;
}

export default function TransactionHistory({ 
  transactions, 
  onViewReceipt 
}: TransactionHistoryProps) {
  const [searchDate, setSearchDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatPrice = (price: string | number) => {
    const value = parseFloat(price.toString());
    return `$${ value.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }`;
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy 'at' h:mm a");
  };

  const filteredTransactions = searchDate 
    ? transactions.filter(t => {
        const transactionDate = format(new Date(t.createdAt!), "yyyy-MM-dd");
        return transactionDate === searchDate;
      })
    : transactions;

  const todayTotal = transactions
    .filter(t => {
      const transactionDate = format(new Date(t.createdAt!), "yyyy-MM-dd");
      const today = format(new Date(), "yyyy-MM-dd");
      return transactionDate === today;
    })
    .reduce((sum, t) => sum + parseFloat(t.total), 0);

  return (
    <Card className="p-6 h-full flex flex-col" data-testid="card-transaction-history">
      <div className="space-y-6 flex-1 min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Historial de transacciones</h3>
          </div>
          <Badge variant="secondary" data-testid="text-transaction-count">
            {transactions.length} transacciones
          </Badge>
        </div>

        {/* Search and Summary */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-date" className="text-sm">Filtrar por fecha</Label>
            <Input
              id="search-date"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              data-testid="input-search-date"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Ventas del día</div>
              <div className="text-xl font-bold text-primary" data-testid="text-today-total">
                {formatPrice(todayTotal)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Transacciones</div>
              <div className="text-xl font-bold">
                {filteredTransactions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron transacciones</p>
              {searchDate && <p className="text-sm">Intenta una fecha diferente</p>}
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card 
                key={transaction.id} 
                className="p-4 hover-elevate cursor-pointer" 
                onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
                data-testid={`card-transaction-${transaction.id}`}
              >
                <div className="space-y-3">
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground" data-testid={`text-transaction-date-${transaction.id}`}>
                        {formatDateTime(transaction.createdAt!)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {transaction.itemCount} {transaction.itemCount === 1 ? 'item' : 'items'}
                        </Badge>
                        {transaction.cashierName && (
                          <Badge variant="secondary" className="text-xs">
                            {transaction.cashierName}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-bold text-primary" data-testid={`text-transaction-total-${transaction.id}`}>
                        {formatPrice(transaction.total)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === transaction.id ? null : transaction.id);
                          }}
                          data-testid={`button-expand-${transaction.id}`}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {onViewReceipt && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewReceipt(transaction);
                            }}
                            data-testid={`button-receipt-${transaction.id}`}
                          >
                            <Receipt className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Transaction Details */}
                  {expandedId === transaction.id && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="space-y-1">
                        {transaction.items.map((item, index) => (
                          <div 
                            key={item.id || index} 
                            className="flex justify-between text-sm"
                            data-testid={`text-transaction-item-${transaction.id}-${index}`}
                          >
                            <span className="truncate">
                              {item.productName} ({item.weight} {item.unit})
                            </span>
                            <span>{formatPrice(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Recibido:</span>
                          <div className="font-medium">{formatPrice(transaction.amountReceived)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cambio:</span>
                          <div className="font-medium">{formatPrice(transaction.change)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <div className="font-bold text-primary">{formatPrice(transaction.total)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}