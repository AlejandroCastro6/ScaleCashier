import TransactionCart from '../TransactionCart';
import type { CartItem } from '@shared/schema';

export default function TransactionCartExample() {
  //todo: remove mock functionality
  const mockCartItems: CartItem[] = [
    {
      productId: "1",
      productCode: "APL001",
      productName: "Organic Apples",
      weight: 1.250,
      pricePerUnit: 3.99,
      subtotal: 4.99,
      taxRate: 5,
      taxAmount: 0.25,
      total: 5.24,
      unit: "kg",
    },
    {
      productId: "2",
      productCode: "SAL002",
      productName: "Fresh Salmon",
      weight: 0.750,
      pricePerUnit: 24.99,
      subtotal: 18.74,
      taxRate: 19,
      taxAmount: 3.56,
      total: 22.30,
      unit: "kg",
    }
  ];

  const handleRemoveItem = (index: number) => {
    console.log('Remove item at index:', index);
  };

  const handleClearCart = () => {
    console.log('Clear cart');
  };

  const handleProcessTransaction = () => {
    console.log('Process transaction');
  };

  return (
    <TransactionCart 
      items={mockCartItems}
      onRemoveItem={handleRemoveItem}
      onClearCart={handleClearCart}
      onProcessTransaction={handleProcessTransaction}
    />
  );
}