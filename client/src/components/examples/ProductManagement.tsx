import ProductManagement from '../ProductManagement';
import type { Product, InsertProduct } from '@shared/schema';

export default function ProductManagementExample() {
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
      isActive: 0,
      createdAt: new Date(),
    }
  ];

  const handleAddProduct = (product: InsertProduct) => {
    console.log('Add product:', product);
  };

  const handleEditProduct = (productId: string, product: InsertProduct) => {
    console.log('Edit product:', productId, product);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log('Delete product:', productId);
  };

  return (
    <ProductManagement 
      products={mockProducts}
      onAddProduct={handleAddProduct}
      onEditProduct={handleEditProduct}
      onDeleteProduct={handleDeleteProduct}
    />
  );
}