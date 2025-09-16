import { useState } from 'react';
import PaymentModal from '../PaymentModal';
import { Button } from '@/components/ui/button';
import type { CartItem } from '@shared/schema';

export default function PaymentModalExample() {
  const [isOpen, setIsOpen] = useState(false);

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

  const total = mockCartItems.reduce((sum, item) => sum + item.total, 0);

  const handleComplete = (amountReceived: number, change: number) => {
    console.log('Payment completed:', { amountReceived, change });
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>
        Open Payment Modal
      </Button>
      
      <PaymentModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onComplete={handleComplete}
        total={total}
        items={mockCartItems}
      />
    </div>
  );
}