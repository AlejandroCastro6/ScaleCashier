import TransactionHistory from '../TransactionHistory';
import type { Transaction, TransactionItem } from '@shared/schema';

interface TransactionWithItems extends Transaction {
  items: TransactionItem[];
}

export default function TransactionHistoryExample() {
  //todo: remove mock functionality
  const mockTransactions: TransactionWithItems[] = [
    {
      id: "1",
      total: "23.73",
      amountReceived: "25.00",
      change: "1.27",
      itemCount: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      cashierName: "John Doe",
      items: [
        {
          id: "1",
          transactionId: "1",
          productId: "1",
          productCode: "APL001",
          productName: "Organic Apples",
          weight: "1.250",
          pricePerUnit: "3.99",
          subtotal: "4.99",
          taxRate: "5",
          taxAmount: "0.25",
          total: "5.24",
          unit: "kg",
        },
        {
          id: "2",
          transactionId: "1",
          productId: "2",
          productCode: "SAL002",
          productName: "Fresh Salmon",
          weight: "0.750",
          pricePerUnit: "24.99",
          subtotal: "18.74",
          taxRate: "19",
          taxAmount: "3.56",
          total: "22.30",
          unit: "kg",
        }
      ]
    },
    {
      id: "2",
      total: "8.99",
      amountReceived: "10.00",
      change: "1.01",
      itemCount: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      cashierName: "Jane Smith",
      items: [
        {
          id: "3",
          transactionId: "2",
          productId: "4",
          productCode: "TOM004",
          productName: "Cherry Tomatoes",
          weight: "1.640",
          pricePerUnit: "5.49",
          subtotal: "8.99",
          taxRate: "0",
          taxAmount: "0.00",
          total: "8.99",
          unit: "kg",
        }
      ]
    }
  ];

  const handleViewReceipt = (transaction: TransactionWithItems) => {
    console.log('View receipt for transaction:', transaction);
  };

  return (
    <TransactionHistory 
      transactions={mockTransactions}
      onViewReceipt={handleViewReceipt}
    />
  );
}