import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import WeightDisplay from "@/components/WeightDisplay";
import ProductGrid from "@/components/ProductGrid";
import ProductSearch from "@/components/ProductSearch";
import TransactionCart from "@/components/TransactionCart";
import PaymentModal from "@/components/PaymentModal";
import ProductManagement from "@/components/ProductManagement";
import TransactionHistory from "@/components/TransactionHistory";
import Header from "@/components/Header";
import { ShoppingCart, Package, History } from "lucide-react";
import type { Product, CartItem, InsertProduct, Transaction, TransactionItem } from "@shared/schema";

// interface TransactionWithItems extends Transaction {
//   items: TransactionItem[];
// }

export default function CashierSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [currentWeight, setCurrentWeight] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pos");

  // API Queries
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  // API Mutations
  const createTransactionMutation = useMutation({
    mutationFn: async (data: { transaction: any; items: any[] }) => {
      const response = await apiRequest("POST", "/api/transactions",  data);
      return response.json();
      // return apiRequest('/api/transactions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products",  product);
      return response.json();
      // return apiRequest('/api/products', {
      //   method: "POST",
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(product)
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, product }: { id: string; product: InsertProduct }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`,  product);
      return response.json();
      // return apiRequest(`/api/products/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(product)
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
      // return apiRequest(`/api/products/${productId}`, {
      //   method: 'DELETE'
      // });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  // Handlers
  const handleWeightChange = (weight: number) => {
    setCurrentWeight(weight);
  };

  const handleSelectProduct = (product: Product) => {
    if (currentWeight <= 0) {
      toast({
        title: "No Weight Detected",
        description: "Please ensure there's weight on the scale before adding products.",
        variant: "destructive",
      });
      return;
    }

    const subtotal = currentWeight * parseFloat(product.pricePerUnit);
    const taxRate = parseFloat(product.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const cartItem: CartItem = {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      weight: currentWeight,
      pricePerUnit: parseFloat(product.pricePerUnit),
      subtotal,
      taxRate,
      taxAmount,
      total,
      unit: product.unit,
    };

    setCartItems(prev => [...prev, cartItem]);
    setSelectedProduct(product);
    
    toast({
      title: "Product Added",
      description: `${product.name} (${currentWeight.toFixed(3)} ${product.unit}) added to cart.`,
    });

    console.log("Product added to cart:", cartItem);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Item Removed",
      description: "Item removed from cart.",
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    setSelectedProduct(null);
    toast({
      title: "Cart Cleared",
      description: "All items removed from cart.",
    });
  };

  const handleProcessTransaction = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Add items to cart before processing transaction.",
        variant: "destructive",
      });
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCompletePayment = (amountReceived: number, change: number) => {
    const total = cartItems.reduce((sum, item) => sum + item.total, 0);
    
    const transaction = {
      total: total.toString(),
      amountReceived: amountReceived.toString(),
      change: change.toString(),
      itemCount: cartItems.length,
      cashierName: "John Doe",
    };

    const items = cartItems.map(item => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      weight: item.weight.toString(),
      pricePerUnit: item.pricePerUnit.toString(),
      subtotal: item.subtotal.toString(),
      taxRate: item.taxRate.toString(),
      taxAmount: item.taxAmount.toString(),
      total: item.total.toString(),
      unit: item.unit,
    }));

    createTransactionMutation.mutate({ transaction, items }, {
      onSuccess: () => {
        setCartItems([]);
        setSelectedProduct(null);
        setIsPaymentModalOpen(false);

        toast({
          title: "Transaction Complete",
          description: `Transaction processed successfully. Change: $${change.toFixed(2)}`,
        });
      },
      onError: (error) => {
        console.error("Transaction error:", error);
        toast({
          title: "Transaction Failed",
          description: "Failed to process transaction. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleAddProduct = (product: InsertProduct) => {
    createProductMutation.mutate(product, {
      onSuccess: () => {
        toast({
          title: "Product Added",
          description: `${product.name} has been added to the product list.`,
        });
      },
      onError: (error) => {
        console.error("Product creation error:", error);
        toast({
          title: "Product Creation Failed",
          description: "Failed to create product. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleEditProduct = (productId: string, productData: InsertProduct) => {
    updateProductMutation.mutate({ id: productId, product: productData }, {
      onSuccess: () => {
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
      },
      onError: (error) => {
        console.error("Product update error:", error);
        toast({
          title: "Product Update Failed",
          description: "Failed to update product. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId, {
      onSuccess: () => {
        toast({
          title: "Product Deleted",
          description: "Product has been removed from the list.",
        });
      },
      onError: (error) => {
        console.error("Product deletion error:", error);
        toast({
          title: "Product Deletion Failed",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header 
        businessName="My Grocery Store"
        cashierName="John Doe"
        onOpenSettings={() => console.log("Open settings")}
      />
      
      <main className="flex-1 p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 mb-6" data-testid="tabs-main">
            <TabsTrigger value="pos" className="flex items-center gap-2" data-testid="tab-pos">
              <ShoppingCart className="w-4 h-4" />
              Point of Sale
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2" data-testid="tab-products">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2" data-testid="tab-history">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="h-full space-y-0">
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Left Column: Products and Scale */}
              <div className="space-y-6">
                <WeightDisplay 
                  onWeightChange={handleWeightChange}
                  unit="kg"
                />
                <ProductSearch 
                  onSelectProduct={handleSelectProduct}
                  placeholder="Search by product code or name..."
                />
                <ProductGrid 
                  products={products.filter(p => p.isActive === 1)}
                  onSelectProduct={handleSelectProduct}
                  selectedProductId={selectedProduct?.id}
                />
              </div>

              {/* Right Column: Transaction Cart */}
              <div className="col-span-2">
                <TransactionCart 
                  items={cartItems}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onProcessTransaction={handleProcessTransaction}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="h-full">
            <ProductManagement 
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="history" className="h-full">
            <TransactionHistory 
              transactions={transactions}
              onViewReceipt={(transaction) => console.log("View receipt:", transaction)}
            />
          </TabsContent>
        </Tabs>
      </main>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onComplete={handleCompletePayment}
        total={cartTotal}
        items={cartItems}
      />
    </div>
  );
}