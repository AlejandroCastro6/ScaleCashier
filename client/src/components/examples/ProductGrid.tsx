import ProductGrid from '../ProductGrid';
import type { Product } from '@shared/schema';

export default function ProductGridExample() {
  //todo: remove mock functionality
  const mockProducts: Product[] = [
    {
      id: "1",
      code: "APL001",
      name: "Organic Apples",
      pricePerUnit: "3.99",
      unit: "kg",
      category: "Fruits",
      taxRate: "5",
      isActive: 1,
      createdAt: new Date(),
    },
    {
      id: "2", 
      code: "SAL002",
      name: "Fresh Salmon",
      pricePerUnit: "24.99",
      unit: "kg",
      category: "Seafood",
      taxRate: "19",
      isActive: 1,
      createdAt: new Date(),
    },
    {
      id: "3",
      code: "BEF003",
      name: "Ground Beef",
      pricePerUnit: "8.99",
      unit: "kg", 
      category: "Meat",
      taxRate: "5",
      isActive: 1,
      createdAt: new Date(),
    },
    {
      id: "4",
      code: "TOM004",
      name: "Cherry Tomatoes",
      pricePerUnit: "5.49",
      unit: "kg",
      category: "Vegetables",
      taxRate: "0",
      isActive: 1,
      createdAt: new Date(),
    }
  ];

  const handleSelectProduct = (product: Product) => {
    console.log('Selected product:', product);
  };

  const handleEditProduct = (product: Product) => {
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Delete product:', productId);
  };

  return (
    <ProductGrid 
      products={mockProducts}
      onSelectProduct={handleSelectProduct}
      onEditProduct={handleEditProduct}
      onDeleteProduct={handleDeleteProduct}
      selectedProductId="1"
    />
  );
}